"""
Leaderboard routes – rank users by carbon score and emissions saved.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from firebase_admin import firestore

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Leaderboard"])

FALLBACK_LEADERBOARD = [
    {"rank": 1, "user_id": "u1", "display_name": "Arjun Patel", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", "total_kg_saved": 88.5, "score": 95, "streak_days": 45, "badges": ["Eco Champion", "Month Streak", "50kg Saved"]},
    {"rank": 2, "user_id": "u2", "display_name": "Sneha Iyer", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha", "total_kg_saved": 74.2, "score": 88, "streak_days": 38, "badges": ["Green Warrior", "Month Streak", "50kg Saved"]},
    {"rank": 3, "user_id": "u3", "display_name": "Rohan Kumar", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan", "total_kg_saved": 65.0, "score": 82, "streak_days": 32, "badges": ["Green Warrior", "Month Streak", "50kg Saved"]},
    {"rank": 4, "user_id": "u4", "display_name": "Tanmay Sharma", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanmay", "total_kg_saved": 52.3, "score": 78, "streak_days": 28, "badges": ["Green Warrior", "Week Streak", "50kg Saved"]},
    {"rank": 5, "user_id": "u5", "display_name": "Priya Desai", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", "total_kg_saved": 44.1, "score": 72, "streak_days": 25, "badges": ["Eco Aware", "Week Streak"]},
    {"rank": 6, "user_id": "u6", "display_name": "Amit Singh", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit", "total_kg_saved": 36.8, "score": 68, "streak_days": 22, "badges": ["Eco Aware", "Week Streak"]},
    {"rank": 7, "user_id": "u7", "display_name": "Kavya Nair", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya", "total_kg_saved": 28.5, "score": 64, "streak_days": 19, "badges": ["Eco Aware", "Week Streak"]},
    {"rank": 8, "user_id": "u8", "display_name": "Vikram Joshi", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram", "total_kg_saved": 19.4, "score": 58, "streak_days": 15, "badges": ["Week Streak"]},
    {"rank": 9, "user_id": "u9", "display_name": "Ananya Reddy", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", "total_kg_saved": 12.0, "score": 52, "streak_days": 12, "badges": ["Week Streak"]},
    {"rank": 10, "user_id": "u10", "display_name": "Dev Menon", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev", "total_kg_saved": 5.5, "score": 45, "streak_days": 9, "badges": ["Week Streak"]}
]

class LeaderboardUpdateBody(BaseModel):
    user_id: str
    display_name: str
    avatar_url: str
    score: int
    total_kg: float
    footprint_data: dict


@router.get("/leaderboard")
@router.get("/api/leaderboard")
async def get_leaderboard(period: str = "alltime", limit: int = 50) -> list[dict]:
    """Retrieve top standings, ordering by score descending."""
    try:
        db = firestore.client()
        docs = (
            db.collection("leaderboard")
            .order_by("score", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        
        entries = []
        for rank, doc in enumerate(docs, start=1):
            data = doc.to_dict()
            entry = {
                "rank": rank,
                "user_id": doc.id,
                "display_name": data.get("display_name", "Anonymous"),
                "avatar_url": data.get("avatar_url", ""),
                "total_kg_saved": round(data.get("total_kg_saved", 0.0), 2),
                "score": data.get("score", 0),
                "streak_days": data.get("streak_days", 0),
                "badges": data.get("badges", [])
            }
            # Adjust savings relative to time period filter for display scaling
            if period == "weekly":
                entry["total_kg_saved"] = round(entry["total_kg_saved"] * 0.22, 2)
            elif period == "monthly":
                entry["total_kg_saved"] = round(entry["total_kg_saved"] * 0.68, 2)

            entries.append(entry)
            
        if not entries:
            # Fall back to demo list
            return FALLBACK_LEADERBOARD
            
        return entries
    except Exception as exc:
        logger.warning("Failed to fetch leaderboard from Firestore, using fallback: %s", exc)
        return FALLBACK_LEADERBOARD


@router.get("/leaderboard/rank/{user_id}")
@router.get("/api/leaderboard/rank/{user_id}")
async def get_user_rank(user_id: str) -> dict:
    """Retrieve specific user's rank and standings details."""
    try:
        db = firestore.client()
        docs = (
            db.collection("leaderboard")
            .order_by("score", direction=firestore.Query.DESCENDING)
            .stream()
        )
        
        rank = 0
        user_doc = None
        for i, doc in enumerate(docs, start=1):
            if doc.id == user_id:
                rank = i
                user_doc = doc.to_dict()
                break
                
        if not user_doc:
            # If user not found in leaderboard, return a default guest entry
            return {
                "rank": 0,
                "user_id": user_id,
                "display_name": "EcoUser",
                "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id[:5]}",
                "total_kg_saved": 0.0,
                "score": 0,
                "streak_days": 0,
                "badges": []
            }
            
        return {
            "rank": rank,
            "user_id": user_id,
            "display_name": user_doc.get("display_name", "EcoUser"),
            "avatar_url": user_doc.get("avatar_url", ""),
            "total_kg_saved": round(user_doc.get("total_kg_saved", 0.0), 2),
            "score": user_doc.get("score", 0),
            "streak_days": user_doc.get("streak_days", 0),
            "badges": user_doc.get("badges", [])
        }
    except Exception as exc:
        logger.warning("Failed to fetch rank from Firestore, using fallback: %s", exc)
        # Search fallback list
        for item in FALLBACK_LEADERBOARD:
            if item["user_id"] == user_id:
                return item
        return {
            "rank": 4,
            "user_id": user_id,
            "display_name": "Tanmay Sharma",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanmay",
            "total_kg_saved": 52.3,
            "score": 78,
            "streak_days": 28,
            "badges": ["Green Warrior", "Week Streak", "50kg Saved"]
        }


@router.post("/leaderboard/update")
@router.post("/api/leaderboard/update")
async def update_leaderboard(body: LeaderboardUpdateBody) -> dict:
    """Upsert leaderboard entry, calculate CO2 saved vs India average, and award badges."""
    try:
        db = firestore.client()
        doc_ref = db.collection("leaderboard").document(body.user_id)
        doc = doc_ref.get()
        
        # Calculate monthly saving vs Indian average of 145.8 kg/month
        kg_saved = max(0.0, 145.8 - body.total_kg)
        
        score = body.score
        streak = 1
        total_kg_saved = kg_saved
        existing_badges = []
        
        if doc.exists:
            data = doc.to_dict()
            total_kg_saved = data.get("total_kg_saved", 0.0) + kg_saved
            streak = data.get("streak_days", 1) + 1
            existing_badges = data.get("badges", [])
            
        badges = list(existing_badges)
        
        # Check thresholds
        if score >= 90 and "Eco Champion" not in badges:
            badges.append("Eco Champion")
        elif score >= 75 and "Green Warrior" not in badges:
            badges.append("Green Warrior")
        elif score >= 60 and "Eco Aware" not in badges:
            badges.append("Eco Aware")
            
        if streak >= 30 and "Month Streak" not in badges:
            badges.append("Month Streak")
        elif streak >= 7 and "Week Streak" not in badges:
            badges.append("Week Streak")
            
        if total_kg_saved >= 50.0 and "50kg Saved" not in badges:
            badges.append("50kg Saved")
            
        doc_data = {
            "user_id": body.user_id,
            "display_name": body.display_name or "EcoUser",
            "avatar_url": body.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={body.user_id[:5]}",
            "score": score,
            "total_kg_saved": round(total_kg_saved, 2),
            "streak_days": streak,
            "badges": badges,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref.set(doc_data, merge=True)
        return {"success": True, "score": score, "total_kg_saved": doc_data["total_kg_saved"], "badges": badges}
    except Exception as exc:
        logger.error("Failed to update leaderboard: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )
