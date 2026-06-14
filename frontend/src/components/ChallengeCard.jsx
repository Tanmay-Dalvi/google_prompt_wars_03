import { motion } from 'framer-motion';

const CATEGORY_ICONS = {
  transport: '🚗',
  food: '🥗',
  energy: '⚡',
  shopping: '🛍️',
  environment: '🌳',
};

const DIFFICULTY_COLORS = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ChallengeCard({ challenge, onJoin, onComplete, userChallenges = [] }) {
  if (!challenge) return null;

  // Find if user has participation record for this challenge
  const userChallenge = userChallenges.find(
    (uc) => uc.challenge_id === challenge.id || uc.id === challenge.id
  );

  const isJoined = !!userChallenge;
  const isCompleted = userChallenge?.status === 'completed';
  const isActive = userChallenge?.status === 'active';

  const categoryIcon = CATEGORY_ICONS[challenge.category] || '🌱';
  const difficultyColor = DIFFICULTY_COLORS[challenge.difficulty?.toLowerCase()] || DIFFICULTY_COLORS.medium;

  const joinedDate = userChallenge?.joined_at ? new Date(userChallenge.joined_at) : new Date();
  const elapsedMs = Math.max(0, new Date() - joinedDate);
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, challenge.duration_days - elapsedDays);
  const progress = isCompleted ? 100 : isActive ? Math.min(95, Math.max(5, Math.round(((challenge.duration_days - daysRemaining) / challenge.duration_days) * 100))) : 0;

  return (
    <motion.div
      role="article"
      aria-label={`${challenge.title} challenge, ${challenge.difficulty} difficulty`}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.15)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative bg-gray-900/90 backdrop-blur-md border rounded-2xl p-5 transition-all ${
        isCompleted
          ? 'border-green-500/30 bg-green-500/[0.02]'
          : isActive
          ? 'border-yellow-500/25 bg-yellow-500/[0.01]'
          : 'border-gray-800 hover:border-green-500/30'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <span className="text-3xl shrink-0 p-2.5 bg-gray-950 rounded-xl border border-gray-800">
          {categoryIcon}
        </span>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
              {challenge.title}
            </h4>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border tracking-wider ${difficultyColor}`}
            >
              {challenge.difficulty}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            {challenge.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-xxs sm:text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              ⏱️ {challenge.duration_days} days
            </span>
            <span className="flex items-center gap-1">
              🌱 {challenge.co2_saving_kg || challenge.co2Savings || 0} kg CO₂
            </span>
            <span className="flex items-center gap-1 text-green-400">
              🪙 {challenge.points} pts
            </span>
          </div>

          {/* Progress Section */}
          {isActive && (
            <div className="mt-4 pt-3 border-t border-gray-850">
              <div className="flex items-center justify-between text-xxs mb-1.5 font-bold uppercase tracking-wider text-yellow-500">
                <span>In Progress ({daysRemaining} days left)</span>
                <span>{progress}%</span>
              </div>
              <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                />
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="mt-4 pt-3 border-t border-gray-850">
              <div className="flex items-center justify-between text-xxs mb-1.5 font-bold uppercase tracking-wider text-green-400">
                <span>Completed</span>
                <span>100%</span>
              </div>
              <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={100} className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              </div>
            </div>
          )}

          {/* Button Group */}
          <div className="mt-4 flex items-center justify-end">
            {!isJoined && (
              <button
                onClick={() => onJoin && onJoin(challenge.id)}
                aria-label={`Join ${challenge.title}`}
                className="px-4 py-2 text-xxs sm:text-xs font-bold text-eco-dark bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all active:scale-95"
              >
                Join Challenge
              </button>
            )}

            {isActive && (
              <button
                onClick={() => onComplete && onComplete(challenge.id)}
                aria-label={`Mark ${challenge.title} as complete`}
                className="px-4 py-2 text-xxs sm:text-xs font-bold text-eco-dark bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-95"
              >
                Complete Challenge
              </button>
            )}

            {isCompleted && (
              <span className="px-3.5 py-1.5 text-xxs font-black text-green-400 bg-green-500/10 border border-green-500/25 rounded-xl uppercase tracking-wider flex items-center gap-1">
                ✅ Done
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
