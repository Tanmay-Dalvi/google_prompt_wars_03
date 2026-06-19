import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FALLBACK_NUDGES = {
  transport: {
    icon: '🚗',
    title: 'Commuting Tip',
    message: 'Transport is your largest emission source this period. Try taking public transit or carpooling!',
  },
  food: {
    icon: '🥗',
    title: 'Dietary Choice',
    message: 'Your meals are contributing most to your footprint. Swapping one beef meal for a vegetarian dish saves ~6.4 kg CO₂!',
  },
  energy: {
    icon: '⚡',
    title: 'Energy Conservation',
    message: 'Utility usage is driving up your footprint. Unplug standby chargers and switch off unused appliances!',
  },
  shopping: {
    icon: '🛍️',
    title: 'Sustainable Shopping',
    message: 'Consumer items represent your highest category. Consider second-hand alternatives or repair old goods first!',
  },
};

export default function ActionNudge({ highestCategory }) {
  const [visible, setVisible] = useState(false);
  const [nudge, setNudge] = useState(null);

  useEffect(() => {
    if (!highestCategory) return;

    const fetchNudge = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL || ''}/insights/nudge/${highestCategory}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Nudge API failed');
        }
        const data = await response.json();
        
        // Find suitable icon
        let icon = '🌱';
        if (highestCategory === 'transport') icon = '🚗';
        else if (highestCategory === 'food') icon = '🥗';
        else if (highestCategory === 'energy') icon = '⚡';
        else if (highestCategory === 'shopping') icon = '🛍️';

        setNudge({
          icon,
          title: `${highestCategory.charAt(0).toUpperCase() + highestCategory.slice(1)} Advice`,
          message: data.nudge,
        });
        setVisible(true);
      } catch (err) {
        console.warn('Failed to fetch AI nudge, using local fallback:', err);
        const fallback = FALLBACK_NUDGES[highestCategory] || FALLBACK_NUDGES.transport;
        setNudge(fallback);
        setVisible(true);
      }
    };

    // Trigger after a brief initial delay
    const delayTimer = setTimeout(() => {
      fetchNudge();
    }, 4000);

    return () => clearTimeout(delayTimer);
  }, [highestCategory]);

  useEffect(() => {
    if (visible) {
      const autoClose = setTimeout(() => setVisible(false), 10000);
      return () => clearTimeout(autoClose);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && nudge && (
        <motion.div
          initial={{ opacity: 0, y: 80, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 80, x: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-green-500/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <div className="flex items-start gap-3">
              {/* Pulsing Icon */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-3xl shrink-0 mt-0.5"
              >
                {nudge.icon}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-green-400">
                    {nudge.title}
                  </h4>
                  <button
                    onClick={() => setVisible(false)}
                    className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {nudge.message}
                </p>
              </div>
            </div>

            {/* Auto-dismiss progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="mt-3 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
