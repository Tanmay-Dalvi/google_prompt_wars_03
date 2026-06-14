import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';

const DEMO_USERS = [
  { id: 1, name: 'Arjun Patel', co2Saved: 342.5, streak: 45, avatar: 'Arjun' },
  { id: 2, name: 'Sneha Iyer', co2Saved: 298.1, streak: 38, avatar: 'Sneha' },
  { id: 3, name: 'Rohan Kumar', co2Saved: 276.9, streak: 32, avatar: 'Rohan' },
  { id: 4, name: 'Tanmay Sharma', co2Saved: 254.3, streak: 28, avatar: 'Tanmay', isCurrentUser: true },
  { id: 5, name: 'Priya Desai', co2Saved: 231.7, streak: 25, avatar: 'Priya' },
  { id: 6, name: 'Amit Singh', co2Saved: 198.2, streak: 22, avatar: 'Amit' },
  { id: 7, name: 'Kavya Nair', co2Saved: 187.6, streak: 19, avatar: 'Kavya' },
  { id: 8, name: 'Vikram Joshi', co2Saved: 165.4, streak: 15, avatar: 'Vikram' },
  { id: 9, name: 'Ananya Reddy', co2Saved: 143.8, streak: 12, avatar: 'Ananya' },
  { id: 10, name: 'Dev Menon', co2Saved: 121.2, streak: 9, avatar: 'Dev' },
];

const RANK_STYLES = [
  { badge: '🥇', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { badge: '🥈', bg: 'bg-gray-400/10', border: 'border-gray-400/30', text: 'text-gray-300' },
  { badge: '🥉', bg: 'bg-amber-700/10', border: 'border-amber-700/30', text: 'text-amber-500' },
];

const Leaderboard = memo(function Leaderboard({ users, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');

  const displayUsers = useMemo(() => {
    if (!users || users.length === 0) return DEMO_USERS;
    return users.map((u, index) => ({
      id: u.user_id || u.id || `user-${index}`,
      name: u.display_name || u.name || 'Anonymous',
      co2Saved: u.total_co2_saved !== undefined ? u.total_co2_saved : (u.co2Saved || 0),
      streak: u.streak_days !== undefined ? u.streak_days : (u.streak || 0),
      avatar: u.avatar_url || u.avatar || 'Anonymous',
      isCurrentUser: u.isCurrentUser || (currentUser && (u.user_id === currentUser.uid || u.id === currentUser.uid))
    })).sort((a, b) => b.co2Saved - a.co2Saved);
  }, [users, currentUser]);

  const filteredUsers = useMemo(
    () =>
      displayUsers.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [displayUsers, searchQuery]
  );

  const topThree = filteredUsers.slice(0, 3);
  const rest = filteredUsers.slice(3);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            aria-label="Search leaderboard by name"
            className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-green-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
          />
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {topThree.map((user, i) => {
          const style = RANK_STYLES[i];
          const isCenter = i === 0;
          const avatarUrl = user.avatar.startsWith('http')
            ? user.avatar
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`relative flex flex-col items-center text-center p-4 rounded-2xl border ${style.bg} ${style.border} ${
                isCenter ? 'order-2 -mt-2 scale-105 shadow-[0_0_25px_rgba(234,179,8,0.1)]' : i === 1 ? 'order-1' : 'order-3'
              } ${user.isCurrentUser ? 'ring-1 ring-green-500/40' : ''}`}
            >
              <span className="text-3xl mb-2">{style.badge}</span>
              <img
                src={avatarUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-gray-700 mb-2 object-cover bg-gray-800"
              />
              <p className={`text-sm font-bold ${style.text} truncate w-full`}>
                {user.name}
              </p>
              <p className="text-lg font-black text-white mt-1">
                {user.co2Saved.toFixed(1)}
                <span className="text-xs text-gray-500 font-normal ml-1">kg</span>
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-xs">🔥</span>
                <span className="text-xs text-gray-400">{user.streak} days</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of the leaderboard */}
      <div className="bg-gray-900/80 border border-green-500/20 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <div className="divide-y divide-gray-800">
          {rest.map((user, i) => {
            const avatarUrl = user.avatar.startsWith('http')
              ? user.avatar
              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-800/40 ${
                  user.isCurrentUser
                    ? 'bg-green-500/5 border-l-2 border-l-green-500'
                    : ''
                }`}
              >
                {/* Rank */}
                <span className="w-8 text-center text-sm font-bold text-gray-500">
                  #{i + 4}
                </span>

                {/* Avatar */}
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-gray-700 shrink-0 object-cover bg-gray-800"
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${user.isCurrentUser ? 'text-green-400' : 'text-gray-200'}`}>
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="ml-2 text-xs text-green-500/70">(You)</span>
                    )}
                  </p>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs">🔥</span>
                  <span className="text-xs text-gray-400">{user.streak}d</span>
                </div>

                {/* CO2 Saved */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{user.co2Saved.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">kg CO₂</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default Leaderboard;
