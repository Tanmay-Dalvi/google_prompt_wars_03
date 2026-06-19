import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';

const RANK_STYLES = [
  { badge: '🥇', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', podiumOrder: 'order-2 scale-105 shadow-[0_0_30px_rgba(234,179,8,0.15)] -mt-2' },
  { badge: '🥈', bg: 'bg-gray-400/10', border: 'border-gray-400/30', text: 'text-gray-300', podiumOrder: 'order-1' },
  { badge: '🥉', bg: 'bg-amber-700/10', border: 'border-amber-700/30', text: 'text-amber-600', podiumOrder: 'order-3' },
];

const FALLBACK_LEADERBOARD = [
  {"rank": 1, "user_id": "u1", "display_name": "Arjun Patel", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", "total_kg_saved": 88.5, "score": 95, "streak_days": 45, "badges": ["Eco Champion", "Month Streak", "50kg Saved"]},
  {"rank": 2, "user_id": "u2", "display_name": "Sneha Iyer", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha", "total_kg_saved": 74.2, "score": 88, "streak_days": 38, "badges": ["Green Warrior", "Month Streak", "50kg Saved"]},
  {"rank": 3, "user_id": "u3", "display_name": "Rohan Kumar", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan", "total_kg_saved": 65.0, "score": 82, "streak_days": 32, "badges": ["Green Warrior", "Month Streak", "50kg Saved"]},
  {"rank": 4, "user_id": "u4", "display_name": "Tanmay Sharma", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanmay", "total_kg_saved": 52.3, "score": 78, "streak_days": 28, "badges": ["Green Warrior", "Week Streak", "50kg Saved"]},
  {"rank": 5, "user_id": "u5", "display_name": "Priya Desai", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", "total_kg_saved": 44.1, "score": 72, "streak_days": 25, "badges": ["Eco Aware", "Week Streak"]},
  {"rank": 6, "user_id": "u6", "display_name": "Amit Singh", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit", "total_kg_saved": 36.8, "score": 68, "streak_days": 22, "badges": ["Eco Aware", "Week Streak"]},
  {"rank": 7, "user_id": "u7", "display_name": "Kavya Nair", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya", "total_kg_saved": 28.5, "score": 64, "streak_days": 19, "badges": ["Eco Aware", "Week Streak"]},
  {"rank": 8, "user_id": "u8", "display_name": "Vikram Joshi", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram", "total_kg_saved": 19.4, "score": 58, "streak_days": 15, "badges": ["Week Streak"]},
  {"rank": 9, "user_id": "u9", "display_name": "Ananya Reddy", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", "total_kg_saved": 12.0, "score": 52, "streak_days": 12, "badges": ["Week Streak"]},
  {"rank": 10, "user_id": "u10", "display_name": "Dev Menon", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev", "total_kg_saved": 5.5, "score": 45, "streak_days": 9, "badges": ["Week Streak"]}
];

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState('alltime'); // 'weekly' | 'monthly' | 'alltime'
  const [usersData, setUsersData] = useState([]);
  const [ownRank, setOwnRank] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch leaderboard data
  useEffect(() => {
    if (!user) return;

    const fetchLeaderboard = async () => {
      setApiLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/leaderboard?period=${timePeriod}&limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setUsersData(data);
      } catch (err) {
        console.warn('Error fetching leaderboard:', err);
        setError(err.message);
        // Fallback to local scaling
        const scaled = FALLBACK_LEADERBOARD.map(u => ({
          ...u,
          total_kg_saved: u.total_kg_saved * (timePeriod === 'weekly' ? 0.22 : timePeriod === 'monthly' ? 0.68 : 1.0)
        }));
        setUsersData(scaled);
      } finally {
        setApiLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, timePeriod]);

  // Fetch current user rank if not in top 50
  useEffect(() => {
    if (!user || apiLoading || usersData.length === 0) return;

    const isInTopFifty = usersData.slice(0, 50).some(u => u.user_id === user.uid);
    if (isInTopFifty) {
      setOwnRank(null);
      return;
    }

    const fetchOwnRank = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/leaderboard/rank/${user.uid}`);
        if (response.ok) {
          const rankData = await response.json();
          setOwnRank(rankData);
        }
      } catch (err) {
        console.warn('Failed to fetch user rank:', err);
        // Mock rank
        setOwnRank({
          rank: 73,
          user_id: user.uid,
          display_name: user.displayName || 'You',
          avatar_url: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          total_kg_saved: 4.2,
          score: 50,
          streak_days: 2,
          badges: []
        });
      }
    };

    fetchOwnRank();
  }, [user, apiLoading, usersData]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    return usersData.filter(u =>
      (u.display_name || u.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usersData, searchQuery]);

  const topThree = useMemo(() => filteredUsers.slice(0, 3), [filteredUsers]);
  const restUsers = useMemo(() => filteredUsers.slice(3, 50), [filteredUsers]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-label="Carbon footprint community leaderboard"
      className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 bg-[#0a0f0a]"
      role="main"
      id="main-content"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl sm:text-4xl font-extrabold text-white mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
          >
            EcoSense Standings
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-md mx-auto text-xs sm:text-sm"
          >
            Join active challenges, reduce carbon emissions, and climb the leaderboard!
          </motion.p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Period tabs */}
          <div className="inline-flex bg-gray-900/90 border border-green-500/10 rounded-2xl p-1 shadow-md">
            {[
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'alltime', label: 'All Time' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setTimePeriod(period.id)}
                className={`relative px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                  timePeriod === period.id
                    ? 'text-eco-dark font-black'
                    : 'text-gray-400 hover:text-green-400'
                }`}
              >
                {timePeriod === period.id && (
                  <motion.div
                    layoutId="leaderboardTab"
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                {period.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name..."
              aria-label="Search leaderboard by name"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/80 border border-green-500/20 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>

        {apiLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-500 text-xs font-semibold">Loading standings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-2xl mx-auto pt-6">
                {topThree.map((item, i) => {
                  const style = RANK_STYLES[i];
                  return (
                    <motion.div
                      key={item.user_id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', delay: i * 0.15, stiffness: 120 }}
                      className={`relative flex flex-col items-center text-center p-3 md:p-5 rounded-3xl border bg-gray-900/90 ${style.podiumOrder} ${style.bg} ${style.border} ${
                        item.user_id === user.uid ? 'ring-2 ring-green-500/50' : ''
                      }`}
                    >
                      <span className="text-3xl md:text-4xl mb-1">{style.badge}</span>
                      <img
                        src={item.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`}
                        alt={item.display_name}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-gray-800 object-cover bg-gray-950 mb-3"
                      />
                      <p className={`text-xs md:text-sm font-black truncate w-full ${style.text}`}>
                        {item.display_name}
                      </p>
                      <div className="mt-2 text-center">
                        <span className="text-lg md:text-2xl font-black text-white">{item.score}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Score</span>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-1 bg-gray-950/45 px-2 py-0.5 rounded-full border border-gray-800">
                        <span className="text-[10px] text-gray-400 font-bold">{item.total_kg_saved.toFixed(1)} kg saved</span>
                      </div>
                      {item.streak_days > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-eco-dark text-[9px] font-black px-1.5 py-0.5 rounded-md shadow flex items-center gap-0.5">
                          🔥 {item.streak_days}d
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Rank List (4-50) */}
            {restUsers.length > 0 ? (
              <motion.div
                variants={{
                  animate: { transition: { staggerChildren: 0.04 } }
                }}
                initial="initial"
                animate="animate"
                className="bg-gray-900/80 border border-green-500/20 rounded-3xl overflow-hidden shadow-lg"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-850 bg-gray-950/50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-4 px-5 text-center">Rank</th>
                        <th className="py-4 px-4">User</th>
                        <th className="py-4 px-4 text-center">Carbon Score</th>
                        <th className="py-4 px-4 text-right">Saved vs India Avg</th>
                        <th className="py-4 px-4">Badges Earned</th>
                        <th className="py-4 px-4 text-center">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850">
                      {restUsers.map((item) => (
                        <motion.tr
                          key={item.user_id}
                          variants={{
                            initial: { opacity: 0, x: -10 },
                            animate: { opacity: 1, x: 0 }
                          }}
                          className={`hover:bg-gray-850/30 transition-colors ${
                            item.user_id === user.uid ? 'bg-green-500/[0.04] border-l-4 border-l-green-500' : ''
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3.5 px-5 text-center font-bold text-gray-500">
                            #{item.rank || item.id}
                          </td>

                          {/* Avatar & Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id}`}
                                alt={item.display_name}
                                className="w-8 h-8 rounded-full border border-gray-800 bg-gray-950 object-cover"
                              />
                              <span className={`font-semibold tracking-wide ${item.user_id === user.uid ? 'text-green-400 font-bold' : 'text-gray-200'}`}>
                                {item.display_name}
                                {item.user_id === user.uid && <span className="ml-1.5 text-[10px] text-green-500/70 font-semibold">(You)</span>}
                              </span>
                            </div>
                          </td>

                          {/* Score Bar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 justify-center min-w-[100px]">
                              <span className="font-bold text-white w-6 text-center">{item.score}</span>
                              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-[80px]">
                                <div
                                  className={`h-full rounded-full ${
                                    item.score >= 75 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Carbon saved */}
                          <td className="py-3.5 px-4 text-right font-bold text-gray-300">
                            {item.total_kg_saved.toFixed(1)} <span className="text-[10px] font-normal text-gray-500">kg</span>
                          </td>

                          {/* Badges */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {item.badges?.slice(0, 3).map((badge, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-bold px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md whitespace-nowrap"
                                >
                                  {badge}
                                </span>
                              ))}
                              {item.badges?.length > 3 && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded-md">
                                  +{item.badges.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Streak */}
                          <td className="py-3.5 px-4 text-center font-bold text-orange-400">
                            {item.streak_days > 0 ? `🔥 ${item.streak_days}d` : '-'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-10 bg-gray-900/40 rounded-3xl border border-gray-850">
                <p className="text-xs text-gray-500">No users found matching query.</p>
              </div>
            )}

            {/* Sticky Bottom Row for Current User Rank (if not in top 50) */}
            {ownRank && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950 border-t border-green-500/20 px-4 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
              >
                <div className="max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500">#{ownRank.rank}</span>
                    <img
                      src={ownRank.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownRank.user_id}`}
                      alt={ownRank.display_name}
                      className="w-7 h-7 rounded-full border border-gray-800 bg-gray-950 object-cover"
                    />
                    <span className="font-bold text-green-400">
                      {ownRank.display_name} <span role="status" aria-live="polite" className="text-xxs text-gray-500 font-semibold">(Your Current Position)</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-gray-500 text-[10px] uppercase font-bold block">Score</span>
                      <span className="font-bold text-white">{ownRank.score}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-[10px] uppercase font-bold block">Saved</span>
                      <span className="font-bold text-green-400">{ownRank.total_kg_saved.toFixed(1)} kg</span>
                    </div>
                    {ownRank.streak_days > 0 && (
                      <span className="bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xxs font-bold px-2 py-1 rounded-lg">
                        🔥 {ownRank.streak_days}d streak
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}
      </div>
    </motion.div>
  );
}
