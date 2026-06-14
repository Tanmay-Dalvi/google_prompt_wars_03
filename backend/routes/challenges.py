"""
Challenge routes – browse, join, complete, and track sustainability challenges.
"""

from __future__ import annotations

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from firebase_admin import firestore

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Challenges"])

CHALLENGES = [
    {"id": "c1", "title": "Meatless Monday", "desc": "Skip meat every Monday for 4 weeks", "category": "food", "difficulty": "easy", "co2_saving_kg": 6.61, "duration_days": 28, "points": 100},
    {"id": "c2", "title": "Public Transport Week", "desc": "Use only public transport for 7 days", "category": "transport", "difficulty": "medium", "co2_saving_kg": 12.5, "duration_days": 7, "points": 150},
    {"id": "c3", "title": "Zero Waste Week", "desc": "Produce zero non-recyclable waste for 7 days", "category": "shopping", "difficulty": "hard", "co2_saving_kg": 5.0, "duration_days": 7, "points": 200},
    {"id": "c4", "title": "Lights Out", "desc": "Reduce electricity usage by 20% this month", "category": "energy", "difficulty": "medium", "co2_saving_kg": 18.0, "duration_days": 30, "points": 175},
    {"id": "c5", "title": "Cycle to Work", "desc": "Bike or walk to work/college 5 days", "category": "transport", "difficulty": "easy", "co2_saving_kg": 8.5, "duration_days": 7, "points": 120},
    {"id": "c6", "title": "Plant a Tree", "desc": "Plant one tree this week", "category": "environment", "difficulty": "easy", "co2_saving_kg": 21.0, "duration_days": 7, "points": 250},
    {"id": "c7", "title": "Cold Shower Week", "desc": "Only cold showers for 7 days", "category": "energy", "difficulty": "hard", "co2_saving_kg": 3.0, "duration_days": 7, "points": 100},
    {"id": "c8", "title": "No Online Shopping", "desc": "Zero online orders for 2 weeks", "category": "shopping", "difficulty": "medium", "co2_saving_kg": 7.0, "duration_days": 14, "points": 130}
]

class ChallengeActionRequest(BaseModel):
    user_id: str
    challenge_id: str


@router.get("/challenges")
@router.get("/api/challenges")
async def list_challenges() -> list[dict]:
    """Return the static list of 8 hardcoded challenges."""
    return CHALLENGES


@router.post("/challenges/join")
@router.post("/api/challenges/join")
async def join_challenge(body: ChallengeActionRequest) -> dict:
    """Join an active challenge."""
    challenge = next((c for c in CHALLENGES if c["id"] == body.challenge_id), None)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )
    
    try:
        db = firestore.client()
        
        # Check if already joined and active
        existing = (
            db.collection("user_challenges")
            .where("user_id", "==", body.user_id)
            .where("challenge_id", "==", body.challenge_id)
            .where("status", "==", "active")
            .limit(1)
            .stream()
        )
        if any(True for _ in existing):
            return {"success": True, "message": "Already joined this challenge", "challenge": challenge}

        # Save participation
        doc_ref = db.collection("user_challenges").add({
            "user_id": body.user_id,
            "challenge_id": body.challenge_id,
            "status": "active",
            "joined_at": firestore.SERVER_TIMESTAMP
        })
        
        return {"success": True, "id": doc_ref[1].id, "challenge": challenge}
    except Exception as exc:
        logger.error("Failed to join challenge: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )


@router.post("/challenges/complete")
@router.post("/api/challenges/complete")
async def complete_challenge(body: ChallengeActionRequest) -> dict:
    """Mark a challenge as completed and award points/CO2 savings."""
    challenge = next((c for c in CHALLENGES if c["id"] == body.challenge_id), None)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found",
        )
    
    try:
        db = firestore.client()
        
        # Find active participation doc
        participations = (
            db.collection("user_challenges")
            .where("user_id", "==", body.user_id)
            .where("challenge_id", "==", body.challenge_id)
            .where("status", "==", "active")
            .limit(1)
            .stream()
        )
        
        p_doc = None
        for doc in participations:
            p_doc = doc
            break

        if not p_doc:
            # Check if it was already completed
            completed_exist = (
                db.collection("user_challenges")
                .where("user_id", "==", body.user_id)
                .where("challenge_id", "==", body.challenge_id)
                .where("status", "==", "completed")
                .limit(1)
                .stream()
            )
            if any(True for _ in completed_exist):
                return {"success": True, "points_earned": 0, "badge_unlocked": None, "message": "Challenge already completed"}
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User has not joined this challenge or it is already completed"
            )

        # Mark completed
        p_doc.reference.update({
            "status": "completed",
            "completed_at": firestore.SERVER_TIMESTAMP
        })

        # Update user's standings on the leaderboard
        lb_ref = db.collection("leaderboard").document(body.user_id)
        lb_doc = lb_ref.get()

        points_earned = challenge["points"]
        co2_saved_kg = challenge["co2_saving_kg"]

        new_score = points_earned
        new_kg_saved = co2_saved_kg
        new_streak = 1
        existing_badges = []

        if lb_doc.exists:
            lb_data = lb_doc.to_dict()
            new_score = lb_data.get("score", 0) + points_earned
            new_kg_saved = lb_data.get("total_kg_saved", 0.0) + co2_saved_kg
            new_streak = lb_data.get("streak_days", 1) + 1
            existing_badges = lb_data.get("badges", [])
        
        # Award new badges based on score thresholds and completed challenge
        badge_unlocked = None
        new_badges = list(existing_badges)
        
        thresholds = [
            (90, "Eco Champion"),
            (75, "Green Warrior"),
            (60, "Eco Aware"),
        ]
        
        # Check score badges
        for th, badge_name in thresholds:
            if new_score >= th and badge_name not in new_badges:
                new_badges.append(badge_name)
                badge_unlocked = badge_name
                
        # Check streak badges
        if new_streak >= 30 and "Month Streak" not in new_badges:
            new_badges.append("Month Streak")
            badge_unlocked = "Month Streak"
        elif new_streak >= 7 and "Week Streak" not in new_badges:
            new_badges.append("Week Streak")
            badge_unlocked = "Week Streak"

        # Check kg saved badges
        if new_kg_saved >= 50.0 and "50kg Saved" not in new_badges:
            new_badges.append("50kg Saved")
            badge_unlocked = "50kg Saved"

        lb_data_update = {
            "score": new_score,
            "total_kg_saved": round(new_kg_saved, 2),
            "streak_days": new_streak,
            "badges": new_badges,
            "display_name": lb_data.get("display_name", "EcoUser") if lb_doc.exists else "EcoUser",
            "avatar_url": lb_data.get("avatar_url", "") if lb_doc.exists else f"https://api.dicebear.com/7.x/avataaars/svg?seed={body.user_id[:5]}",
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        lb_ref.set(lb_data_update, merge=True)

        return {"success": True, "points_earned": points_earned, "badge_unlocked": badge_unlocked}

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to complete challenge: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )


@router.get("/challenges/user/{user_id}")
@router.get("/api/challenges/user/{user_id}")
async def get_user_challenges(user_id: str) -> list[dict]:
    """Retrieve user's active and completed challenge participations."""
    try:
        db = firestore.client()
        docs = (
            db.collection("user_challenges")
            .where("user_id", "==", user_id)
            .stream()
        )
        
        participations = []
        for doc in docs:
            d = doc.to_dict()
            cid = d.get("challenge_id")
            # Find the matching challenge details
            challenge = next((c for c in CHALLENGES if c["id"] == cid), None)
            if challenge:
                item = {
                    "id": doc.id,
                    "challenge_id": cid,
                    "user_id": user_id,
                    "status": d.get("status", "active"),
                    "joined_at": d.get("joined_at"),
                    "completed_at": d.get("completed_at"),
                    **challenge
                }
                # Format timestamps
                for key in ("joined_at", "completed_at"):
                    if isinstance(item.get(key), datetime):
                        item[key] = item[key].isoformat()
                participations.append(item)
        return participations
    except Exception as exc:
        logger.error("Failed to fetch user challenges: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )
