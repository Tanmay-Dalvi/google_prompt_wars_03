import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';

const STEPS = [
  {
    key: 'transport',
    title: 'Transport',
    icon: '🚗',
    description: 'Weekly travel habits',
  },
  {
    key: 'food',
    title: 'Food',
    icon: '🥗',
    description: 'Weekly diet & meals',
  },
  {
    key: 'energy',
    title: 'Energy',
    icon: '⚡',
    description: 'Monthly home utility use',
  },
  {
    key: 'shopping',
    title: 'Shopping',
    icon: '🛍️',
    description: 'Monthly consumer goods',
  },
];

export default function FootprintForm({ onSubmit }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Transport (weekly)
    car_km: 0,
    flight_hours: 0,
    public_transport_km: 0,
    two_wheeler_km: 0,
    // Step 2: Food (weekly)
    beef_meals: 0,
    chicken_meals: 0,
    vegetarian_meals: 0,
    food_waste_kg: 0,
    // Step 3: Energy (monthly)
    electricity_kwh: 0,
    lpg_cylinders: 0,
    ac_hours_per_day: 0,
    // Step 4: Shopping (monthly)
    online_orders: 0,
    clothing_items: 0,
    electronics_bought: 0,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocalCalculation = () => {
    // Calculate category carbon scores locally (Weekly scaled by 4.3 for monthly projection)
    const transportVal = (
      formData.car_km * 0.21 +
      formData.flight_hours * 255.0 +
      formData.public_transport_km * 0.089 +
      formData.two_wheeler_km * 0.113
    ) * 4.3;

    const foodVal = (
      formData.beef_meals * 6.61 +
      formData.chicken_meals * 0.69 +
      formData.vegetarian_meals * 0.16 +
      formData.food_waste_kg * 2.5
    ) * 4.3;

    const energyVal = (
      formData.electricity_kwh * 0.82 +
      formData.lpg_cylinders * 12.7 +
      formData.ac_hours_per_day * 30.0 * 0.82 * 1.5
    );

    const shoppingVal = (
      formData.online_orders * 0.5 +
      formData.clothing_items * 10.0 +
      formData.electronics_bought * 300.0
    );

    const breakdown = {
      transport: parseFloat(transportVal.toFixed(2)),
      food: parseFloat(foodVal.toFixed(2)),
      energy: parseFloat(energyVal.toFixed(2)),
      shopping: parseFloat(shoppingVal.toFixed(2)),
    };

    const total_kg = parseFloat((transportVal + foodVal + energyVal + shoppingVal).toFixed(2));
    const score = Math.max(0, Math.min(100, Math.round(100 - (total_kg * 0.2))));
    const comparison_pct = parseFloat((((total_kg - 145.8) / 145.8) * 100.0).toFixed(2));
    const highest_category = Object.keys(breakdown).reduce((a, b) => breakdown[a] > breakdown[b] ? a : b);

    return {
      total_kg,
      breakdown,
      score,
      india_avg_monthly: 145.8,
      comparison_pct,
      highest_category,
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setApiError(false);
    
    const payload = {
      ...formData,
      user_id: user?.uid || 'demo-user-001',
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Calculate and Save via Backend
      const calcUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/footprint/calculate`;
      const response = await fetch(calcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const resultData = await response.json();
      
      // Attempt to save to firestore database asynchronously
      try {
        const saveUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/footprint/save`;
        await fetch(saveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('Failed to persist footprint in database:', err);
      }

      if (onSubmit) {
        onSubmit({ ...resultData, inputs: payload });
      }
    } catch (err) {
      console.warn('API error, falling back to local carbon calculation:', err);
      setApiError(true);
      const localResult = handleLocalCalculation();
      if (onSubmit) {
        // Mock a slight delay to feel realistic
        setTimeout(() => {
          onSubmit({ ...localResult, inputs: payload });
        }, 800);
      }
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 250 : -250, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -250 : 250, opacity: 0 }),
  };

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const SliderInput = ({ label, field, min, max, unit, stepVal = 1 }) => {
    const val = formData[field];
    const inputId = `input_${field}`;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor={inputId} className="text-sm text-gray-300 font-medium">{label}</label>
          <span className="text-sm font-bold text-green-400">
            {val} <span className="text-xxs text-gray-500 font-normal">{unit}</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <input
            id={inputId}
            type="range"
            min={min}
            max={max}
            step={stepVal}
            value={val}
            aria-required="true"
            onChange={(e) => updateField(field, parseFloat(e.target.value))}
            className="flex-1 accent-green-500 bg-gray-950 h-2 rounded-lg"
          />
          <input
            type="number"
            min={min}
            max={max}
            value={val}
            aria-label={`${label} numeric input`}
            aria-required="true"
            onChange={(e) => {
              const num = parseFloat(e.target.value) || 0;
              updateField(field, Math.min(max, Math.max(min, num)));
            }}
            className="w-16 px-2 py-1 bg-gray-950 border border-gray-800 text-center rounded-lg text-xs font-semibold text-gray-200 focus:outline-none focus:border-green-500/50"
          />
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="transport"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <fieldset className="space-y-4 border-none p-0 m-0">
              <legend className="sr-only">Step 1: Transport</legend>
              <SliderInput label="Car travel (km/week)" field="car_km" min={0} max={500} unit="km" />
              <SliderInput label="Flight travel (hours/week)" field="flight_hours" min={0} max={20} unit="hrs" />
              <SliderInput label="Public transit (km/week)" field="public_transport_km" min={0} max={200} unit="km" />
              <SliderInput label="Two-wheeler (km/week)" field="two_wheeler_km" min={0} max={300} unit="km" />
            </fieldset>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="food"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <fieldset className="space-y-4 border-none p-0 m-0">
              <legend className="sr-only">Step 2: Food</legend>
              <SliderInput label="Beef & lamb meals/week" field="beef_meals" min={0} max={21} unit="meals" />
              <SliderInput label="Chicken & fish meals/week" field="chicken_meals" min={0} max={21} unit="meals" />
              <SliderInput label="Vegetarian/Vegan meals/week" field="vegetarian_meals" min={0} max={21} unit="meals" />
              <SliderInput label="Food waste generated/week" field="food_waste_kg" min={0} max={10} unit="kg" stepVal={0.1} />
            </fieldset>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="energy"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <fieldset className="space-y-4 border-none p-0 m-0">
              <legend className="sr-only">Step 3: Energy</legend>
              <SliderInput label="Electricity usage/month" field="electricity_kwh" min={0} max={500} unit="kWh" />
              <SliderInput label="LPG cylinder refills/month" field="lpg_cylinders" min={0} max={5} unit="cylinders" />
              <SliderInput label="Air Conditioner use/day" field="ac_hours_per_day" min={0} max={24} unit="hrs/day" stepVal={0.5} />
            </fieldset>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="shopping"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <fieldset className="space-y-4 border-none p-0 m-0">
              <legend className="sr-only">Step 4: Shopping</legend>
              <SliderInput label="Online delivery orders/month" field="online_orders" min={0} max={30} unit="orders" />
              <SliderInput label="New clothing purchases/month" field="clothing_items" min={0} max={20} unit="garments" />
              <SliderInput label="Electronics bought/month" field="electronics_bought" min={0} max={5} unit="items" />
            </fieldset>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900/80 border border-green-500/20 rounded-3xl p-6 shadow-[0_0_20px_rgba(34,197,94,0.05)] max-w-lg mx-auto">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">Log Emissions Details</h3>
        <p className="text-xs text-gray-500">Provide estimates to calculate your ecological footprint</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center gap-1.5 mb-6">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-800'
              }`}
            />
            <span
              className={`text-[10px] font-bold tracking-tight transition-colors duration-300 flex items-center gap-1 ${
                i === step ? 'text-green-400' : i < step ? 'text-gray-500' : 'text-gray-700'
              }`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Inputs Body */}
      <div className="min-h-[280px] bg-gray-950/40 border border-gray-850/80 rounded-2xl p-5 mb-5 overflow-hidden relative flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full"
            />
            <p className="text-xs text-gray-500 font-medium">Calculating carbon equivalent...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        )}
      </div>

      {/* Offline Fallback Alert */}
      {apiError && (
        <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-xl text-xxs flex items-center gap-2">
          <span>⚠️</span>
          <span>Offline mode active: results estimated locally using standard formulas.</span>
        </div>
      )}

      {/* Stepper controls */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <button
          onClick={goPrev}
          disabled={step === 0 || loading}
          className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-gray-200 disabled:opacity-20 transition-all"
        >
          ← Back
        </button>
        <span className="text-xxs text-gray-600 font-semibold uppercase tracking-wider">
          Step {step + 1} of {STEPS.length}
        </span>
        <button
          onClick={goNext}
          disabled={loading}
          className="px-6 py-2.5 text-xs font-bold text-eco-dark bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50"
        >
          {step === STEPS.length - 1 ? (
            <span>Submit Summary 🌏</span>
          ) : (
            <span>Next Step →</span>
          )}
        </button>
      </div>
    </div>
  );
}
