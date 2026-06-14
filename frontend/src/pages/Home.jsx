import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Typewriter hook
function useTypewriter(text, speed = 60) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// Floating leaf particle
function FloatingLeaf({ delay, x }) {
  return (
    <motion.div
      className="absolute text-lg pointer-events-none select-none opacity-20"
      initial={{ x, y: -20, rotate: 0 }}
      animate={{
        y: ['0vh', '100vh'],
        x: [x, x + 50, x - 30, x + 20],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      🍃
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: '📊',
    title: 'Track Emissions',
    description: 'Log daily transport, food, energy, and shopping data with our intuitive multi-step form.',
  },
  {
    icon: '🤖',
    title: 'AI Insights',
    description: 'Get personalized recommendations powered by Gemini AI to reduce your carbon footprint.',
  },
  {
    icon: '🌍',
    title: 'Live Visualization',
    description: 'Watch our planet heal in real-time as you and the community lower emissions together.',
  },
  {
    icon: '🏆',
    title: 'Challenges & Ranks',
    description: 'Join weekly challenges, climb the leaderboard, and earn eco-badges for your efforts.',
  },
];

const STATS = [
  { value: '10,000+', label: 'Active Users' },
  { value: '50 tons', label: 'CO₂ Saved' },
  { value: '2,500+', label: 'Challenges Done' },
  { value: '98%', label: 'Satisfaction' },
];

export default function Home() {
  const navigate = useNavigate();
  const { displayed, done } = useTypewriter('Track Your Impact. Save the Planet.');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
      role="main"
      id="main-content"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-eco-dark via-gray-900 to-eco-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.08)_0%,_transparent_70%)]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating leaves */}
        {[...Array(8)].map((_, i) => (
          <FloatingLeaf key={i} delay={i * 2} x={Math.random() * 100 + '%'} />
        ))}

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400 font-medium">
              Carbon Footprint Awareness Platform
            </span>
          </motion.div>

          {/* Typewriter Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6 min-h-[1.2em]">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              {displayed}
            </span>
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-green-400"
              >
                |
              </motion.span>
            )}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            EcoSense uses AI to analyze your daily habits, provide personalized insights,
            and gamify sustainability. Join thousands making a real difference.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 text-lg font-bold text-eco-dark bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:shadow-xl hover:shadow-green-500/25 transition-all active:scale-95 hover:-translate-y-0.5"
            >
              Get Started 🌱
            </button>
            <a
              href="#features"
              className="px-8 py-3.5 text-lg font-semibold text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/10 transition-all"
            >
              Learn More
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2"
            >
              <div className="w-1 h-2 bg-green-500 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Go{' '}
              <span className="text-green-400">Green</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Powerful tools designed to make sustainability easy, engaging, and impactful.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900/80 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 hover:shadow-[0_0_25px_rgba(34,197,94,0.1)] transition-all group"
              >
                <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-y border-green-500/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-gray-400 mb-8">
              Join the community of eco-warriors tracking their impact and saving the planet, one day at a time.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 text-lg font-bold text-eco-dark bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:shadow-xl hover:shadow-green-500/25 transition-all active:scale-95"
            >
              Start Your Journey 🌿
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                EcoSense
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
              <Link to="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
              <Link to="/leaderboard" className="hover:text-green-400 transition-colors">Leaderboard</Link>
              <Link to="/profile" className="hover:text-green-400 transition-colors">Profile</Link>
            </div>
            <p className="text-xs text-gray-600">
              © 2026 EcoSense. Built for a greener tomorrow.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
