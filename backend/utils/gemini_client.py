"""
Async wrapper around Google's Generative AI (Gemini) SDK.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

import google.generativeai as genai

logger = logging.getLogger(__name__)


class GeminiClient:
    """Thin async client for the Gemini generative-AI API using gemini-1.5-flash."""

    def __init__(self) -> None:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            logger.warning(
                "GEMINI_API_KEY is not set – AI insight endpoints will return "
                "fallback responses."
            )
        genai.configure(api_key=api_key)
        model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        self._model = genai.GenerativeModel(model_name)
        logger.info("GeminiClient initialised with model=%s", model_name)

    async def generate_insights(self, footprint_data: dict[str, Any], user_name: str) -> dict[str, Any]:
        """Generate personalised eco-insights from footprint data.

        Returns a dict with summary, tips (5 items), quick_win, and monthly_savings_potential_kg.
        """
        prompt = self._build_insights_prompt(footprint_data, user_name)
        return await self._call_gemini(prompt, parse_json=True)

    async def generate_nudge(self, highest_category: str) -> str:
        """Generate a short motivating behavioral nudge for the highest emission category."""
        prompt = self._build_nudge_prompt(highest_category)
        result = await self._call_gemini(prompt, parse_json=False)
        return str(result)

    @staticmethod
    def _build_insights_prompt(data: dict[str, Any], user_name: str) -> str:
        """Construct prompt for the insights generator."""
        breakdown = data.get("breakdown", {})
        total = data.get("total_kg", 0.0)

        return f"""You are EcoSense, an expert AI sustainability advisor.
Personalized analysis for user: {user_name}

Analyse the following monthly carbon-footprint data and return **exactly** a JSON object (no markdown fences, no extra text) matching this schema:
{{
  "summary": "2-sentence personalized summary of user's footprint performance and highlights.",
  "tips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3",
    "Specific actionable tip 4",
    "Specific actionable tip 5"
  ],
  "quick_win": "Single most impactful action the user can take this week to start saving carbon.",
  "monthly_savings_potential_kg": 25.5
}}

### User's monthly carbon footprint:
- **Total emissions**: {total:.2f} kg CO2
- **Transport**: {breakdown.get('transport', 0.0):.2f} kg CO2
- **Food**: {breakdown.get('food', 0.0):.2f} kg CO2
- **Energy**: {breakdown.get('energy', 0.0):.2f} kg CO2
- **Shopping**: {breakdown.get('shopping', 0.0):.2f} kg CO2

### Guidelines:
1. Provide highly specific tips related to their highest emission sources.
2. Maintain an encouraging and motivating tone.
3. Return ONLY a valid JSON object."""

    @staticmethod
    def _build_nudge_prompt(highest_category: str) -> str:
        """Construct prompt for a single behavioral nudge."""
        return f"""You are EcoSense, a motivating sustainability coach.
The user's highest emission category is **{highest_category}**.

Write a single, encouraging, actionable nudge sentence (max 15 words) recommending a simple action to reduce emissions in this category. Include a relevant emoji (e.g. 🚗, 🥗, ⚡, 🛍️). Return only the raw text sentence."""

    async def generate_news(self, topics: list[str]) -> dict[str, Any]:
        """Generate 4 eco news items based on a list of topics using Gemini."""
        prompt = self._build_news_prompt(topics)
        result = await self._call_gemini(prompt, parse_json=True, fallback_type="news")
        if isinstance(result, dict):
            return result
        return {"news": []}

    @staticmethod
    def _build_news_prompt(topics: list[str]) -> str:
        """Construct prompt for the eco news generator."""
        topics_str = ", ".join(topics)
        return f"""You are EcoSense, an AI sustainability editor.
Generate exactly 4 eco news items based on the following topics: {topics_str}.
Return **exactly** a JSON object (no markdown fences, no extra text) matching this schema:
{{
  "news": [
    {{
      "icon": "☀️",
      "headline": "Short bold headline (10 words max)",
      "body": "A 2-sentence description of the news item, explaining its eco-impact or climate significance.",
      "tag": "Energy"
    }}
  ]
}}

Guidelines:
1. Provide exactly 4 items.
2. Each item should have a single emoji as the icon, a short headline (under 10 words), a 2-sentence body, and a tag (e.g. Energy, Transport, Food, Shopping).
3. The items should be highly informative, realistic, and inspiring.
4. Return ONLY a valid JSON object."""

    async def _call_gemini(
        self, prompt: str, *, parse_json: bool = False, fallback_type: str = "insights"
    ) -> dict[str, Any] | str:
        """Send prompt to Gemini and handle responses."""
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            return self._fallback_response(parse_json, fallback_type)

        try:
            response = await self._model.generate_content_async(prompt)
            text = response.text.strip()

            if parse_json:
                # Strip markdown code fences if present
                if text.startswith("```"):
                    text = text.split("\n", 1)[-1]
                if text.endswith("```"):
                    text = text.rsplit("```", 1)[0]
                text = text.strip()
                if text.startswith("json"):
                    text = text.split("json", 1)[-1].strip()
                return json.loads(text)

            return text

        except Exception as exc:
            logger.error("Gemini API call failed: %s", exc)
            return self._fallback_response(parse_json, fallback_type)

    @staticmethod
    def _fallback_response(as_json: bool, fallback_type: str = "insights") -> dict[str, Any] | str:
        """Return a safe fallback when the AI model is offline or unconfigured."""
        if as_json:
            if fallback_type == "news":
                return {
                    "news": [
                        {"icon": "☀️", "headline": "Solar adoption in India hits record high", "body": "India added 18GW of solar capacity last year. Rooftop solar can cut home emissions by 40%.", "tag": "Energy"},
                        {"icon": "🚌", "headline": "Metro expansion reduces city emissions", "body": "New metro lines in 5 cities cut 2M tons CO2 yearly. Choose metro over cab when possible.", "tag": "Transport"},
                        {"icon": "🥗", "headline": "Plant-based diet cuts footprint by 50%", "body": "Switching to vegetarian diet is the single biggest individual climate action. Even one meatless day helps.", "tag": "Food"},
                        {"icon": "♻️", "headline": "Circular economy saves 45% emissions", "body": "Buying second-hand and repairing items dramatically cuts shopping footprint. Try local thrift stores.", "tag": "Shopping"}
                    ]
                }
            return {
                "summary": "Your carbon footprint is looking reasonable, but there are opportunities to reduce it further. Small adjustments in transport and food choices can make a significant cumulative impact.",
                "tips": [
                    "Swap short car journeys (under 5 km) for cycling or walking.",
                    "Switch to energy-efficient LED bulbs at home to save on electricity.",
                    "Incorporate more vegetarian or plant-based meals into your weekly diet.",
                    "Avoid food waste by planning meals and shopping with a list.",
                    "Consider buying clothes from second-hand shops or sustainable brands."
                ],
                "quick_win": "Switch one beef/lamb meal to vegetarian this week to save ~6.5 kg of CO2.",
                "monthly_savings_potential_kg": 35.0,
            }
        return "Swap one short car trip this week for a walk or bike ride! 🚶"


# Singleton instance
gemini_client = GeminiClient()
