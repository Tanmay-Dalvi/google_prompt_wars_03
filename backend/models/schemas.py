"""
Pydantic schemas for EcoSense API request/response validation.
All numeric fields are validated to be non-negative using Field constraints.
"""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class FootprintEntry(BaseModel):
    """Input schema for carbon footprint calculation."""
    user_id: Optional[str] = Field(default=None, description="Firebase user ID")
    # Transport (weekly)
    car_km: float = Field(default=0, ge=0, le=10000, description="Weekly km driven by car")
    flight_hours: float = Field(default=0, ge=0, le=500, description="Weekly flight hours")
    public_transport_km: float = Field(default=0, ge=0, le=5000, description="Weekly public transport km")
    two_wheeler_km: float = Field(default=0, ge=0, le=5000, description="Weekly two-wheeler km")
    # Food (weekly meals)
    beef_meals: float = Field(default=0, ge=0, le=21, description="Weekly beef/lamb meals")
    chicken_meals: float = Field(default=0, ge=0, le=21, description="Weekly chicken/fish meals")
    vegetarian_meals: float = Field(default=0, ge=0, le=21, description="Weekly vegetarian meals")
    food_waste_kg: float = Field(default=0, ge=0, le=100, description="Weekly food waste in kg")
    # Energy (monthly)
    electricity_kwh: float = Field(default=0, ge=0, le=10000, description="Monthly electricity usage kWh")
    lpg_cylinders: float = Field(default=0, ge=0, le=20, description="Monthly LPG cylinders")
    ac_hours_per_day: float = Field(default=0, ge=0, le=24, description="Daily AC usage hours")
    # Shopping (monthly)
    online_orders: float = Field(default=0, ge=0, le=500, description="Monthly online orders")
    clothing_items: float = Field(default=0, ge=0, le=100, description="Monthly new clothing items")
    electronics_bought: float = Field(default=0, ge=0, le=50, description="Monthly electronics purchased")


class FootprintResponse(BaseModel):
    """Response schema for footprint calculation."""
    total_kg: float = Field(description="Total monthly CO2 equivalent in kg")
    breakdown: dict = Field(description="Breakdown by category")
    score: int = Field(ge=0, le=100, description="Eco score 0-100, higher is greener")
    india_avg_monthly: float = Field(default=145.8, description="India average monthly kg CO2")
    comparison_pct: float = Field(description="% above or below India average")
    highest_category: str = Field(description="Category with highest emissions")


class InsightRequest(BaseModel):
    """Request schema for AI insight generation."""
    user_id: Optional[str] = Field(default=None)
    user_name: str = Field(default="User", min_length=1, max_length=100)
    footprint_data: dict = Field(description="Footprint calculation result")


class InsightResponse(BaseModel):
    """Response schema for AI insights."""
    summary: str
    tips: list[str]
    quick_win: str
    monthly_savings_potential_kg: float = Field(ge=0)


class LeaderboardEntry(BaseModel):
    """Single leaderboard entry."""
    rank: int = Field(ge=1)
    user_id: str
    display_name: str
    avatar_url: str = Field(default="")
    total_kg_saved: float = Field(ge=0)
    score: int = Field(ge=0, le=100)
    streak_days: int = Field(default=0, ge=0)
    badges: list[str] = Field(default=[])


class ChallengeJoinRequest(BaseModel):
    """Request to join a challenge."""
    user_id: str = Field(min_length=1)
    challenge_id: str = Field(min_length=1)


class ChallengeCompleteRequest(BaseModel):
    """Request to complete a challenge."""
    user_id: str = Field(min_length=1)
    challenge_id: str = Field(min_length=1)


class NewsRequest(BaseModel):
    """Request for AI-generated eco news."""
    topics: list[str] = Field(default=["carbon footprint", "climate action India"])
