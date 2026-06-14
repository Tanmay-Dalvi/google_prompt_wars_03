"""
Carbon footprint calculator using exact emission factors for weekly/monthly calculations.
"""

from __future__ import annotations

from datetime import datetime
from models.schemas import FootprintEntry, FootprintResponse


class CarbonCalculator:
    """Calculator converting weekly/monthly activities into monthly kg CO2."""

    @classmethod
    def calculate_total(cls, entry: FootprintEntry) -> FootprintResponse:
        """Calculate carbon footprint and return breakdown, comparison and score."""
        # 1. Transport (weekly to monthly conversion: multiply weekly by 4.3)
        car_co2 = entry.car_km * 0.21
        flight_co2 = entry.flight_hours * 255.0
        public_transport_co2 = entry.public_transport_km * 0.089
        two_wheeler_co2 = entry.two_wheeler_km * 0.113
        
        weekly_transport = car_co2 + flight_co2 + public_transport_co2 + two_wheeler_co2
        monthly_transport = weekly_transport * 4.3

        # 2. Food (weekly to monthly conversion: multiply weekly by 4.3)
        beef_co2 = entry.beef_lamb_meals * 6.61
        chicken_co2 = entry.chicken_fish_meals * 0.69
        veg_co2 = entry.vegetarian_meals * 0.16
        waste_co2 = entry.food_waste_kg * 2.5
        
        weekly_food = beef_co2 + chicken_co2 + veg_co2 + waste_co2
        monthly_food = weekly_food * 4.3

        # 3. Energy (monthly items)
        electricity_co2 = entry.electricity_kwh * 0.82
        lpg_co2 = entry.lpg_cylinders * 12.7
        ac_co2 = entry.ac_hours_day * 30.0 * 0.82 * 1.5
        
        monthly_energy = electricity_co2 + lpg_co2 + ac_co2

        # 4. Shopping (monthly items)
        online_orders_co2 = entry.online_orders_count * 0.5
        clothing_co2 = entry.clothing_items * 10.0
        electronics_co2 = entry.electronics_bought * 300.0
        
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

        return FootprintResponse(
            total_kg=total_kg,
            breakdown=breakdown,
            score=score,
            india_avg_monthly=india_avg,
            comparison_pct=comparison_pct,
            highest_category=highest_category,
            timestamp=entry.timestamp or datetime.utcnow(),
        )
