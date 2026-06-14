import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart } from 'react-google-charts';
import FootprintForm from './FootprintForm';
import InsightCard from './InsightCard';
import WorldVisualizer from './WorldVisualizer';
import ActionNudge from './ActionNudge';
import EcoNewsFeed from './EcoNewsFeed';

export default function Dashboard({ user }) {
  const [result, setResult] = useState(null);

  const displayName = user?.displayName || 'Eco Warrior';
  const firstName = displayName.split(' ')[0];

  const handleReset = () => {
    setResult(null);
  };

  const getScoreColorClass = (score) => {
    if (score > 70) return 'text-green-400';
    if (score > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgClass = (score) => {
    if (score > 70) return 'stroke-green-500';
    if (score > 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  // SVG Circular progress params
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              {firstName}
            </span>{' '}
            👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Measure and visualize your lifestyle's environmental footprint
          </p>
        </div>
        {result && (
          <button
            onClick={handleReset}
            className="self-start sm:self-auto px-4 py-2 text-xs font-bold text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/5 transition-all"
          >
            🔄 Log New Entry
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          // Form View
          <motion.div
            key="form-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="py-4"
          >
            <FootprintForm onSubmit={setResult} />
          </motion.div>
        ) : (
          // Results View
          <motion.div
            key="results-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Overall stats & Breakdown (span 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Score ring, Total carbon, Comparison bar */}
              <div className="bg-gray-900/80 border border-green-500/20 rounded-3xl p-6 shadow-[0_0_20px_rgba(34,197,94,0.03)] flex flex-col md:flex-row items-center gap-8">
                
                {/* SVG Score Circle */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-36 h-36 transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      stroke="#1f2937"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {/* Foreground Score Ring */}
                    <motion.circle
                      cx="72"
                      cy="72"
                      r={radius}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - (result.score / 100) * circumference }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`${getScoreBgClass(result.score)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className={`text-3xl font-black ${getScoreColorClass(result.score)}`}>
                      {result.score}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Score</p>
                  </div>
                </div>

                {/* Big stats & details */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Monthly Footprint</span>
                    <h2 className="text-4xl font-black text-white mt-1">
                      {result.total_kg.toFixed(1)} <span className="text-xl text-gray-400 font-medium">kg CO₂e</span>
                    </h2>
                  </div>

                  {/* Comparison bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Your Footprint vs India Average</span>
                      <span className={`font-bold ${result.comparison_pct <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {result.comparison_pct <= 0 ? '' : '+'}{result.comparison_pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-850">
                      {/* India average indicator mark (145.8 kg) */}
                      <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-yellow-500/80 z-10">
                        <span className="absolute -top-4 -left-6 text-[9px] text-yellow-500 font-semibold">India Avg</span>
                      </div>
                      {/* User's bar */}
                      <motion.div
                        className={`h-full rounded-full ${result.comparison_pct <= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        initial={{ width: 0 }}
                        // Scaled User bar relative to 240kg max cap for UI representation
                        animate={{ width: `${Math.min(100, (result.total_kg / 240) * 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {result.comparison_pct <= 0 
                        ? `Nice! You are saving carbon compared to the Indian national average (145.8 kg/month).`
                        : `Your footprint is higher than the average Indian. Look at the AI recommendations below.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Charts: Pie & Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/80 border border-green-500/20 rounded-3xl p-5 shadow-[0_0_15px_rgba(34,197,94,0.03)]">
                  <Chart
                    chartType="PieChart"
                    width="100%"
                    height="300px"
                    data={[
                      ['Category', 'kg CO2'],
                      ['Transport', result.breakdown.transport],
                      ['Food', result.breakdown.food],
                      ['Energy', result.breakdown.energy],
                      ['Shopping', result.breakdown.shopping],
                    ]}
                    options={{
                      title: 'Your Emissions Breakdown',
                      backgroundColor: 'transparent',
                      legend: { textStyle: { color: '#d1fae5' } },
                      titleTextStyle: { color: '#d1fae5', fontSize: 14, bold: true },
                      pieSliceTextStyle: { color: '#fff' },
                      slices: {
                        0: { color: '#3b82f6' },
                        1: { color: '#22c55e' },
                        2: { color: '#f59e0b' },
                        3: { color: '#ec4899' },
                      },
                      chartArea: { width: '90%', height: '80%' },
                    }}
                  />
                </div>
                <div className="bg-gray-900/80 border border-green-500/20 rounded-3xl p-5 shadow-[0_0_15px_rgba(34,197,94,0.03)]">
                  <Chart
                    chartType="BarChart"
                    width="100%"
                    height="300px"
                    data={[
                      ['Category', 'You', 'India Avg', 'Global Avg'],
                      ['Transport', result.breakdown.transport, 45, 80],
                      ['Food', result.breakdown.food, 35, 60],
                      ['Energy', result.breakdown.energy, 40, 70],
                      ['Shopping', result.breakdown.shopping, 25.8, 50],
                    ]}
                    options={{
                      title: 'You vs World',
                      backgroundColor: 'transparent',
                      legend: { textStyle: { color: '#d1fae5' } },
                      titleTextStyle: { color: '#d1fae5', fontSize: 14, bold: true },
                      hAxis: { textStyle: { color: '#9ca3af' } },
                      vAxis: { textStyle: { color: '#9ca3af' } },
                      colors: ['#22c55e', '#f59e0b', '#ef4444'],
                      chartArea: { width: '75%', height: '70%' },
                    }}
                  />
                </div>
              </div>

              {/* Green Spaces Near You Maps embed */}
              <div className="bg-gray-900/80 border border-green-500/20 rounded-3xl p-6 shadow-[0_0_20px_rgba(34,197,94,0.03)]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  🗺️ Green Spaces Near You
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Find parks, cycling paths, and eco-friendly spots
                </p>
                <div className="w-full h-[300px] overflow-hidden rounded-xl border border-gray-850 bg-gray-950">
                  <iframe
                    title="Green Spaces Maps search"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyD-placeholder'}&q=parks+and+green+spaces+near+me&zoom=12`}
                  />
                </div>
              </div>

              {/* Eco News Feed */}
              <EcoNewsFeed />

              {/* Category Breakdown Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'transport', label: 'Transport', icon: '🚗', val: result.breakdown.transport, color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
                  { key: 'food', label: 'Food', icon: '🥗', val: result.breakdown.food, color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                  { key: 'energy', label: 'Energy', icon: '⚡', val: result.breakdown.energy, color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' },
                  { key: 'shopping', label: 'Shopping', icon: '🛍️', val: result.breakdown.shopping, color: 'border-pink-500/20 text-pink-400 bg-pink-500/5' },
                ].map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`border rounded-2xl p-4 shadow-sm flex items-center gap-4 ${item.color}`}
                  >
                    <span className="text-3xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xxs text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                      <p className="text-lg font-black text-white mt-0.5">
                        {item.val.toFixed(1)} <span className="text-xs font-normal text-gray-400">kg</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Insights Card */}
              <InsightCard footprintData={result.inputs} userId={user?.uid} />

            </div>

            {/* Right Column: World Visualizer (span 1) */}
            <div className="space-y-6">
              <WorldVisualizer score={result.score} />
              
              {/* Dynamic Nudge Warning Popup */}
              <ActionNudge highestCategory={result.highest_category} />
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
