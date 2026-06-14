"""
Pydantic models and schemas for the EcoSense Carbon Footprint Platform.

Defines request/response models, enumerations, and data-transfer objects
used across all API endpoints.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class TransportMode(str, Enum):
    """Supported modes of transport for carbon-footprint calculation."""

    CAR = "car"
    BUS = "bus"
    TRAIN = "train"
    BIKE = "bike"
    WALK = "walk"
    PLANE = "plane"


class FoodType(str, Enum):
    """Dietary categories used when estimating food-related emissions."""

    OMNIVORE = "omnivore"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PESCATARIAN = "pescatarian"


class EnergySource(str, Enum):
    """Household energy-source types."""

    GRID = "grid"
    SOLAR = "solar"
    WIND = "wind"
    MIXED = "mixed"


class Difficulty(str, Enum):
    """Challenge difficulty levels."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ChallengeStatus(str, Enum):
    """Participation status for a sustainability challenge."""

    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


# ---------------------------------------------------------------------------
# Core footprint models
# ---------------------------------------------------------------------------

class FootprintEntry(BaseModel):
    """A single carbon-footprint log entry submitted by the user."""

    # Step 1: Transport (weekly)
    car_km: float = Field(default=0.0, ge=0.0, le=500.0)
    flight_hours: float = Field(default=0.0, ge=0.0, le=20.0)
    public_transport_km: float = Field(default=0.0, ge=0.0, le=200.0)
    two_wheeler_km: float = Field(default=0.0, ge=0.0, le=300.0)

    # Step 2: Food (weekly)
    beef_lamb_meals: int = Field(default=0, ge=0, le=21)
    chicken_fish_meals: int = Field(default=0, ge=0, le=21)
    vegetarian_meals: int = Field(default=0, ge=0, le=21)
    food_waste_kg: float = Field(default=0.0, ge=0.0, le=10.0)

    # Step 3: Energy (monthly)
    electricity_kwh: float = Field(default=0.0, ge=0.0, le=500.0)
    lpg_cylinders: int = Field(default=0, ge=0, le=5)
    ac_hours_day: float = Field(default=0.0, ge=0.0, le=24.0)

    # Step 4: Shopping (monthly)
    online_orders_count: int = Field(default=0, ge=0, le=30)
    clothing_items: int = Field(default=0, ge=0, le=20)
    electronics_bought: int = Field(default=0, ge=0, le=5)

    user_id: str = Field(..., min_length=1)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class FootprintResponse(BaseModel):
    """Response returned after calculating a footprint entry."""

    total_kg: float = Field(..., description="Total CO2 emissions in kg.")
    breakdown: dict[str, float] = Field(..., description="Category breakdown in kg.")
    score: int = Field(..., ge=0, le=100, description="Greenness score 0-100.")
    india_avg_monthly: float = Field(default=145.8)
    comparison_pct: float = Field(..., description="Comparison to Indian monthly average in %.")
    highest_category: str = Field(..., description="Category with highest emissions.")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# AI insight models
# ---------------------------------------------------------------------------

class InsightRequest(BaseModel):
    """Request payload for AI-generated insights."""

    user_id: str = Field(..., min_length=1)
    footprint_data: FootprintEntry


class InsightResponse(BaseModel):
    """AI-generated insights for a user's carbon footprint."""

    insights: list[str] = Field(
        ...,
        description="List of personalised eco-insights.",
    )
    primary_recommendation: str = Field(
        ...,
        description="The single most impactful recommendation.",
    )
    estimated_savings_kg: float = Field(
        ...,
        ge=0,
        description="Estimated CO₂ savings if the recommendation is followed.",
    )


class NudgeResponse(BaseModel):
    """A short behavioural nudge for the user."""

    nudge_text: str = Field(
        ...,
        description="Human-readable nudge message.",
    )
    category: str = Field(
        ...,
        description="Emission category this nudge targets.",
    )
    impact_level: str = Field(
        ...,
        description="Impact level: low, medium, or high.",
    )


# ---------------------------------------------------------------------------
# Leaderboard models
# ---------------------------------------------------------------------------

class LeaderboardEntry(BaseModel):
    """A single row on the public leaderboard."""

    user_id: str
    display_name: str = ""
    avatar_url: str = ""
    total_co2_saved: float = Field(default=0.0, ge=0)
    streak_days: int = Field(default=0, ge=0)
    rank: int = Field(default=0, ge=0)


class LeaderboardUpdateRequest(BaseModel):
    """Payload for updating a user's leaderboard score."""

    user_id: str = Field(..., min_length=1)
    co2_saved: float = Field(..., ge=0, description="Additional CO₂ saved (kg).")
    streak_days: int = Field(default=0, ge=0)


# ---------------------------------------------------------------------------
# Challenge models
# ---------------------------------------------------------------------------

class Challenge(BaseModel):
    """A sustainability challenge users can participate in."""

    id: str = Field(default="", description="Firestore document ID.")
    title: str
    description: str
    category: str = Field(
        ...,
        description="Emission category targeted (transport, food, energy, shopping).",
    )
    difficulty: Difficulty = Difficulty.MEDIUM
    co2_savings_potential: float = Field(
        ...,
        ge=0,
        description="Estimated CO₂ that can be saved by completing the challenge (kg).",
    )
    duration_days: int = Field(..., gt=0)
    participants_count: int = Field(default=0, ge=0)

    model_config = {"use_enum_values": True}


class ChallengeParticipation(BaseModel):
    """Tracks a user's participation in a specific challenge."""

    challenge_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)
    status: ChallengeStatus = ChallengeStatus.ACTIVE
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    model_config = {"use_enum_values": True}


# ---------------------------------------------------------------------------
# User profile model
# ---------------------------------------------------------------------------

class UserProfile(BaseModel):
    """Public-facing user profile."""

    user_id: str
    display_name: str = ""
    email: str = ""
    total_co2_saved: float = Field(default=0.0, ge=0)
    current_streak: int = Field(default=0, ge=0)
    badges: list[str] = Field(default_factory=list)
