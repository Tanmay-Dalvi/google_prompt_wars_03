import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FALLBACK_INSIGHTS = {
  summary: "Your carbon footprint is looking reasonable, but there are opportunities to reduce it further. Small adjustments in transport and food choices can make a significant cumulative impact.",
  tips: [
    "Swap short car journeys (under 5 km) for cycling or walking.",
    "Switch to energy-efficient LED bulbs at home to save on electricity.",
    "Incorporate more vegetarian or plant-based meals into your weekly diet.",
    "Avoid food waste by planning meals and shopping with a list.",
    "Consider buying clothes from second-hand shops or sustainable brands."
  ],
  quick_win: "Switch one beef/lamb meal to vegetarian this week to save ~6.5 kg of CO2.",
  monthly_savings_potential_kg: 35.0,
};

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse" aria-live="polite" aria-busy="true">
      <div className="h-4 bg-gray-800 rounded w-3/4" />
      <div className="h-20 bg-gray-800 rounded w-full" />
      <div className="h-10 bg-gray-800 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function InsightCard({ footprintData, userId }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    if (!footprintData) return;
    setLoading(true);
    setError(null);

    const payload = {
      user_id: userId || 'demo-user-001',
      footprint_data: footprintData,
    };

    try {
      const url = `${import.meta.env.VITE_API_URL || ''}/insights/generate`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.warn('AI Insights generation failed, falling back to local tips:', err);
      // Construct custom fallback based on inputs if possible
      setInsights(FALLBACK_INSIGHTS);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [footprintData, userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gray-900/80 border border-green-500/20 rounded-3xl p-6 shadow-[0_0_15px_rgba(34,197,94,0.05)] overflow-hidden"
    >
      <div className="absolute inset-0 rounded-3xl pointer-events-none">
        <div className="absolute inset-0 rounded-3xl animate-glow-pulse" />
      </div>

      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-2xl"
          >
            🤖
          </motion.span>
          <h3 className="text-lg font-bold text-white">AI Eco-Insights</h3>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/10 disabled:opacity-50 transition-all"
        >
          <svg
            className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Re-Analyze
        </button>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : insights ? (
        <div className="relative space-y-4">
          
          {/* Summary */}
          <p className="text-xs text-gray-400 leading-relaxed italic bg-gray-950/20 p-3 rounded-xl border border-gray-850/50">
            "{insights.summary}"
          </p>

          {/* Quick Win */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-xs font-bold text-green-400 mb-0.5">
                  Quick Win This Week
                </p>
                <p className="text-sm text-gray-200 leading-relaxed font-semibold">
                  {insights.quick_win}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Savings potential */}
          {insights.monthly_savings_potential_kg !== undefined && (
            <div className="flex items-center gap-2 bg-gray-800/40 rounded-lg px-4 py-2.5 border border-gray-800/80">
              <span className="text-lg">🌱</span>
              <div>
                <p className="text-xxs text-gray-500 font-semibold">Estimated Monthly Savings</p>
                <p className="text-base font-black text-green-400">
                  {insights.monthly_savings_potential_kg.toFixed(1)} kg CO₂
                </p>
              </div>
            </div>
          )}

          {/* Tips List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recommended Actions:</h4>
            <ul className="space-y-2.5">
              {insights.tips.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2.5 text-xs text-gray-400"
                >
                  <span className="text-green-500 mt-1 shrink-0">✔</span>
                  <span className="leading-relaxed">{tip}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="text-[10px] text-gray-600 text-center mt-2">
              Note: Offline fallback tips displayed.
            </p>
          )}

        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-6">No footprint data provided for analysis.</p>
      )}
    </motion.div>
  );
}
