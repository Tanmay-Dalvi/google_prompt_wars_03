"""
Footprint routes – calculate, save, and retrieve carbon-footprint entries.
"""

from __future__ import annotations

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from firebase_admin import firestore
from models.schemas import FootprintEntry, FootprintResponse
from utils.carbon_calculator import CarbonCalculator

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Footprint"])


@router.post("/footprint/calculate", response_model=FootprintResponse)
@router.post("/api/footprint/calculate", response_model=FootprintResponse)
async def calculate_footprint(entry: FootprintEntry) -> FootprintResponse:
    """Calculate emissions breakdown, comparison and score from user inputs."""
    try:
        return CarbonCalculator.calculate_total(entry)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


@router.post("/footprint/save", status_code=status.HTTP_201_CREATED)
@router.post("/api/footprint/save", status_code=status.HTTP_201_CREATED)
async def save_footprint(entry: FootprintEntry) -> dict:
    """Calculate and persist a footprint entry in Firestore."""
    try:
        result = CarbonCalculator.calculate_total(entry)
        timestamp = entry.timestamp or datetime.utcnow()

        db = firestore.client()
        doc_data = {
            "car_km": entry.car_km,
            "flight_hours": entry.flight_hours,
            "public_transport_km": entry.public_transport_km,
            "two_wheeler_km": entry.two_wheeler_km,
            "beef_lamb_meals": entry.beef_lamb_meals,
            "chicken_fish_meals": entry.chicken_fish_meals,
            "vegetarian_meals": entry.vegetarian_meals,
            "food_waste_kg": entry.food_waste_kg,
            "electricity_kwh": entry.electricity_kwh,
            "lpg_cylinders": entry.lpg_cylinders,
            "ac_hours_day": entry.ac_hours_day,
            "online_orders_count": entry.online_orders_count,
            "clothing_items": entry.clothing_items,
            "electronics_bought": entry.electronics_bought,
            "user_id": entry.user_id,
            "total_kg": result.total_kg,
            "breakdown": result.breakdown,
            "score": result.score,
            "india_avg_monthly": result.india_avg_monthly,
            "comparison_pct": result.comparison_pct,
            "highest_category": result.highest_category,
            "timestamp": timestamp,
        }

        # 1. Save to subcollection users/{user_id}/footprints
        sub_ref = (
            db.collection("users")
            .document(entry.user_id)
            .collection("footprints")
            .add({**doc_data, "created_at": firestore.SERVER_TIMESTAMP})
        )
        doc_id = sub_ref[1].id

        # 2. Save to root collection "footprints" for direct querying
        db.collection("footprints").add({
            "userId": entry.user_id,
            "timestamp": timestamp,
            "data": doc_data,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        # Also update the user's score on the leaderboard
        try:
            leaderboard_ref = db.collection("leaderboard").document(entry.user_id)
            # CO2 saved can be calculated relative to Indian average or standard baseline
            co2_saved = max(0.0, 200.0 - result.total_kg)
            leaderboard_doc = leaderboard_ref.get()
            if leaderboard_doc.exists:
                existing = leaderboard_doc.to_dict()
                new_total = existing.get("total_co2_saved", 0.0) + co2_saved
                leaderboard_ref.update({
                    "total_co2_saved": round(new_total, 2),
                    "streak_days": existing.get("streak_days", 1) + 1
                })
            else:
                leaderboard_ref.set({
                    "display_name": "EcoUser",
                    "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={entry.user_id[:5]}",
                    "total_co2_saved": round(co2_saved, 2),
                    "streak_days": 1,
                    "created_at": firestore.SERVER_TIMESTAMP
                })
        except Exception as lb_err:
            logger.error("Failed to update leaderboard entry: %s", lb_err)

        return {
            "message": "Footprint saved successfully.",
            "document_id": doc_id,
            "total_kg": result.total_kg,
            "score": result.score,
        }

    except Exception as exc:
        logger.error("Failed to save footprint: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save footprint: {str(exc)}",
        ) from exc


@router.get("/footprint/history/{user_id}")
@router.get("/api/footprint/history/{user_id}")
async def get_footprint_history(user_id: str) -> dict:
    """Retrieve history of footprint logs for the specified user."""
    try:
        db = firestore.client()
        entries = []

        # Try subcollection first
        docs = (
            db.collection("users")
            .document(user_id)
            .collection("footprints")
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(30)
            .stream()
        )
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            entries.append(data)

        # Fallback to root collection if empty
        if not entries:
            root_docs = (
                db.collection("footprints")
                .where("userId", "==", user_id)
                .order_by("timestamp", direction=firestore.Query.DESCENDING)
                .limit(30)
                .stream()
            )
            for doc in root_docs:
                rd = doc.to_dict()
                entry_data = rd.get("data", {})
                entry_data["id"] = doc.id
                entries.append(entry_data)

        # Format datetime timestamps to ISO format
        for item in entries:
            for key in ("timestamp", "created_at"):
                if isinstance(item.get(key), datetime):
                    item[key] = item[key].isoformat()

        return {"user_id": user_id, "count": len(entries), "entries": entries}

    except Exception as exc:
        logger.error("Failed to fetch footprint history: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(exc)}",
        ) from exc


@router.get("/footprint/summary/{user_id}")
@router.get("/api/footprint/summary/{user_id}")
async def get_footprint_summary(user_id: str) -> dict:
    """Retrieve monthly emission averages per category for the user."""
    try:
        db = firestore.client()
        entries = []

        # Try subcollection first
        docs = db.collection("users").document(user_id).collection("footprints").stream()
        entries = [doc.to_dict() for doc in docs]

        # Fallback to root collection if empty
        if not entries:
            root_docs = db.collection("footprints").where("userId", "==", user_id).stream()
            entries = [doc.to_dict().get("data", {}) for doc in root_docs]

        if not entries:
            return {
                "user_id": user_id,
                "total_entries": 0,
                "monthly_averages": {
                    "transport": 0.0,
                    "food": 0.0,
                    "energy": 0.0,
                    "shopping": 0.0,
                },
            }

        totals = {"transport": 0.0, "food": 0.0, "energy": 0.0, "shopping": 0.0}
        for item in entries:
            b = item.get("breakdown", {})
            for cat in totals:
                totals[cat] += b.get(cat, 0.0)

        count = len(entries)
        averages = {k: round(v / count, 2) for k, v in totals.items()}

        return {
            "user_id": user_id,
            "total_entries": count,
            "monthly_averages": averages,
        }

    except Exception as exc:
        logger.error("Failed to generate footprint summary: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(exc)}",
        ) from exc
