import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';

const FALLBACK_NEWS = [
  { icon: '☀️', headline: 'Solar adoption in India hits record high', body: 'India added 18GW of solar capacity last year. Rooftop solar can cut home emissions by 40%.', tag: 'Energy' },
  { icon: '🚌', headline: 'Metro expansion reduces city emissions', body: 'New metro lines in 5 cities cut 2M tons CO2 yearly. Choose metro over cab when possible.', tag: 'Transport' },
  { icon: '🥗', headline: 'Plant-based diet cuts footprint by 50%', body: 'Switching to vegetarian diet is the single biggest individual climate action. Even one meatless day helps.', tag: 'Food' },
  { icon: '♻️', headline: 'Circular economy saves 45% emissions', body: 'Buying second-hand and repairing items dramatically cuts shopping footprint. Try local thrift stores.', tag: 'Shopping' },
];

const EcoNewsFeed = memo(function EcoNewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchNews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/insights/news`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topics: ['carbon footprint', 'climate action India', 'renewable energy'],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (active) {
            setNews(data.news && data.news.length > 0 ? data.news : FALLBACK_NEWS);
          }
        } else {
          throw new Error('API failed');
        }
      } catch (err) {
        console.warn('EcoNewsFeed API error, using fallbacks:', err);
        if (active) {
          setNews(FALLBACK_NEWS);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-gray-900/80 border border-green-500/20 rounded-3xl p-6 shadow-[0_0_20px_rgba(34,197,94,0.03)] space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📰</span> Eco News Feed
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Stay informed with the latest insights and climate actions powered by Gemini AI
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-live="polite" aria-busy="true">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-950/40 border border-gray-800/80 rounded-2xl p-4 h-32 animate-pulse flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {news.map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -4, border: '1px solid rgba(34, 197, 94, 0.4)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-gray-950/40 border border-gray-850 hover:border-green-500/30 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0 p-2 bg-gray-900 border border-gray-800 rounded-xl" role="img" aria-label="news icon">
                  {item.icon || '🌱'}
                </span>
                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {item.headline}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-gray-900/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-green-400 bg-green-500/10 border border-green-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {item.tag || 'Eco Impact'}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  AI Generated
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
});

export default EcoNewsFeed;
