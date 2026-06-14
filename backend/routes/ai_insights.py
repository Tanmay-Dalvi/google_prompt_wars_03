"""
AI Insights routes – generate Gemini-powered eco-tips and nudges.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from models.schemas import InsightRequest
from utils.carbon_calculator import CarbonCalculator
from utils.gemini_client import gemini_client

logger = logging.getLogger(__name__)
router = APIRouter(tags=["AI Insights"])

class NewsRequest(BaseModel):
    topics: list[str]


@router.post("/insights/generate")
@router.post("/api/insights/generate")
async def generate_insights(request: InsightRequest) -> dict:
    """Generate custom carbon footprint suggestions using Gemini."""
    try:
        # Calculate emissions breakdown first
        footprint_result = CarbonCalculator.calculate_total(request.footprint_data)
        ai_data = footprint_result.model_dump()
        
        # Call Gemini client with calculations and default username
        result = await gemini_client.generate_insights(ai_data, "EcoSense User")
        return result
    except Exception as exc:
        logger.error("Failed to generate AI insights: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI insights: {str(exc)}",
        ) from exc


@router.get("/insights/nudge/{category}")
@router.get("/api/insights/nudge/{category}")
async def generate_nudge(category: str) -> dict:
    """Generate a quick behavioral nudge for a specific emission category."""
    valid_categories = {"transport", "food", "energy", "shopping"}
    if category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of {valid_categories}",
        )
    try:
        nudge_text = await gemini_client.generate_nudge(category)
        return {"nudge": nudge_text, "category": category}
    except Exception as exc:
        logger.error("Failed to generate nudge: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate nudge: {str(exc)}",
        ) from exc


@router.post("/insights/news")
@router.post("/api/insights/news")
async def generate_news(request: NewsRequest) -> dict:
    """Generate 4 news-style eco tips using Gemini based on selected topics."""
    try:
        result = await gemini_client.generate_news(request.topics)
        return result
    except Exception as exc:
        logger.error("Failed to generate AI news feed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate news feed: {str(exc)}",
        ) from exc
