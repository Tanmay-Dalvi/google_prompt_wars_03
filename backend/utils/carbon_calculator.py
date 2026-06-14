"""
Carbon footprint calculator using scientifically validated emission factors.

Emission factors sources:
- Transport: IPCC AR6 Working Group III (2022)
- Food: Poore & Nemecek (2018), Science Journal
- Energy: Central Electricity Authority India Grid Factor 2023 (0.82 kgCO2/kWh)
- Shopping: WRAP UK Clothing Lifecycle Assessment (2017)

All outputs are in kg CO2 equivalent (kg CO2e) per month.
"""

from __future__ import annotations
from datetime import datetime
from models.schemas import FootprintEntry, FootprintResponse


def calculate_footprint(data: dict) -> dict:
    """Validate and calculate monthly emissions breakdown, comparison and score."""
    # Validate all numeric inputs are non-negative
    numeric_fields = ['car_km','flight_hours','public_transport_km','two_wheeler_km',
                      'beef_meals','chicken_meals','vegetarian_meals','food_waste_kg',
                      'electricity_kwh','lpg_cylinders','ac_hours_per_day',
                      'online_orders','clothing_items','electronics_bought']
    for field in numeric_fields:
        val = data.get(field, 0)
        if val < 0:
            raise ValueError(f"Field '{field}' cannot be negative. Got: {val}")

    # 1. Transport (weekly to monthly conversion: multiply weekly by 4.3)
    car_co2 = data.get('car_km', 0) * 0.21
    flight_co2 = data.get('flight_hours', 0) * 255.0
    public_transport_co2 = data.get('public_transport_km', 0) * 0.089
    two_wheeler_co2 = data.get('two_wheeler_km', 0) * 0.113
    
    weekly_transport = car_co2 + flight_co2 + public_transport_co2 + two_wheeler_co2
    monthly_transport = weekly_transport * 4.3

    # 2. Food (weekly to monthly conversion: multiply weekly by 4.3)
    beef_co2 = data.get('beef_meals', 0) * 6.61
    chicken_co2 = data.get('chicken_meals', 0) * 0.69
    veg_co2 = data.get('vegetarian_meals', 0) * 0.16
    waste_co2 = data.get('food_waste_kg', 0) * 2.5
    
    weekly_food = beef_co2 + chicken_co2 + veg_co2 + waste_co2
    monthly_food = weekly_food * 4.3

    # 3. Energy (monthly items)
    electricity_co2 = data.get('electricity_kwh', 0) * 0.82
    lpg_co2 = data.get('lpg_cylinders', 0) * 12.7
    ac_co2 = data.get('ac_hours_per_day', 0) * 30.0 * 0.82 * 1.5
    
    monthly_energy = electricity_co2 + lpg_co2 + ac_co2

    # 4. Shopping (monthly items)
    online_orders_co2 = data.get('online_orders', 0) * 0.5
    clothing_co2 = data.get('clothing_items', 0) * 10.0
    electronics_co2 = data.get('electronics_bought', 0) * 300.0
    
    monthly_shopping = online_orders_co2 + clothing_co2 + electronics_co2

    # Aggregate category breakdown
    breakdown = {
        "transport": round(monthly_transport, 2),
        "food": round(monthly_food, 2),
        "energy": round(monthly_energy, 2),
        "shopping": round(monthly_shopping, 2),
    }

    total_kg = round(monthly_transport + monthly_food + monthly_energy + monthly_shopping, 2)

    # Calculate score: 100 = 0 kg, 0 = 500+ kg
    score = int(max(0.0, min(100.0, 100.0 - (total_kg * 0.2))))

    # Comparison with India monthly average (145.8 kg/month)
    india_avg = 145.8
    comparison_pct = round(((total_kg - india_avg) / india_avg) * 100.0, 2)

    # Identify highest emission category
    highest_category = max(breakdown, key=breakdown.get) if total_kg > 0 else "energy"

    return {
        "total_kg": total_kg,
        "breakdown": breakdown,
        "score": score,
        "india_avg_monthly": india_avg,
        "comparison_pct": comparison_pct,
        "highest_category": highest_category,
    }


class CarbonCalculator:
    """Calculator converting weekly/monthly activities into monthly kg CO2."""

    @classmethod
    def calculate_total(cls, entry: FootprintEntry) -> FootprintResponse:
        """Calculate carbon footprint and return breakdown, comparison and score."""
        data = entry.model_dump()
        result = calculate_footprint(data)
        return FootprintResponse(
            total_kg=result["total_kg"],
            breakdown=result["breakdown"],
            score=result["score"],
            india_avg_monthly=result["india_avg_monthly"],
            comparison_pct=result["comparison_pct"],
            highest_category=result["highest_category"],
        )
