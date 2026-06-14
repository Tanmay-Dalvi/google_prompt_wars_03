import { motion } from 'framer-motion';
import { memo } from 'react';

// Cloud Component
function Cloud({ x, y, isPolluted, delay }) {
  const cloudColor = isPolluted ? '#4b5563' : '#ffffff';
  const cloudOpacity = isPolluted ? 0.35 : 0.75;
  return (
    <motion.g
      initial={{ x: -30, opacity: 0 }}
      animate={{
        x: [-30, 30, -30],
        opacity: [cloudOpacity * 0.7, cloudOpacity, cloudOpacity * 0.7],
      }}
      transition={{
        duration: 12 + Math.random() * 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <ellipse cx={x} cy={y} rx={25} ry={12} fill={cloudColor} />
      <circle cx={x - 12} cy={y + 2} r={10} fill={cloudColor} />
      <circle cx={x + 12} cy={y + 1} r={9} fill={cloudColor} />
    </motion.g>
  );
}

// Tree Component
function Tree({ x, y, state, delay }) {
  // state: 'dead' | 'young' | 'mature'
  const isDead = state === 'dead';
  const isMature = state === 'mature';

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 100 }}
    >
      {/* Trunk */}
      <rect x={x - 2} y={y - 10} width="4" height="12" rx="1.5" fill="#5c4033" />
      {/* Leaves */}
      {!isDead && (
        <circle
          cx={x}
          cy={y - 14}
          r={isMature ? 10 : 6}
          fill={isMature ? '#16a34a' : '#4ade80'}
          opacity="0.9"
        />
      )}
      {!isDead && isMature && (
        <>
          <circle cx={x - 6} cy={y - 12} r={7} fill="#15803d" opacity="0.8" />
          <circle cx={x + 6} cy={y - 12} r={7} fill="#14532d" opacity="0.8" />
        </>
      )}
      {isDead && (
        // Bare branches
        <path
          d={`M${x - 4} ${y - 8} L${x} ${y - 4} L${x + 4} ${y - 9} M${x} ${y - 10} L${x} ${y - 4}`}
          stroke="#451a03"
          strokeWidth="1.5"
          fill="none"
        />
      )}
    </motion.g>
  );
}

// Animal Component
function Animal({ x, y, emoji, visible, delay }) {
  return (
    <motion.text
      x={x}
      y={y}
      fontSize="16"
      textAnchor="middle"
      initial={{ scale: 0, y: y + 10, opacity: 0 }}
      animate={visible ? { scale: 1, y, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ duration: 0.6, delay, type: 'spring', damping: 10 }}
    >
      {emoji}
    </motion.text>
  );
}

const WorldVisualizer = memo(function WorldVisualizer({ score = 50 }) {
  // Determine planet status based on score
  const isLow = score <= 30; // 0-30: bad
  const isMed = score > 30 && score <= 60; // 31-60: medium
  const isHigh = score > 60; // 61-100: good

  // Dynamic sky & planet styling
  let skyColor, sunColor, sunGlowColor, planetOceanColor, planetLandColor;
  let statusText, statusSubText, statusColor;

  if (isLow) {
    skyColor = '#1f2937'; // Slate grey
    sunColor = '#ef4444'; // Red sun
    sunGlowColor = 'rgba(239, 68, 68, 0.2)';
    planetOceanColor = '#4b5563'; // Polluted grey
    planetLandColor = '#78350f'; // Dry brown
    statusText = '🏭 Earth in Distress!';
    statusSubText = 'High footprint is polluting the atmosphere. Take steps to restore nature.';
    statusColor = 'text-red-400';
  } else if (isMed) {
    skyColor = '#78350f'; // Orange-amber sky
    sunColor = '#fbbf24'; // Orange-yellow sun
    sunGlowColor = 'rgba(251, 191, 36, 0.25)';
    planetOceanColor = '#0891b2'; // Cyan ocean
    planetLandColor = '#ca8a04'; // Muted yellowish green
    statusText = '🌱 Greener Horizons';
    statusSubText = 'Footprint is near average. Keep reducing to let life return to the land.';
    statusColor = 'text-yellow-400';
  } else {
    skyColor = '#0284c7'; // Blue sky
    sunColor = '#fbbf24'; // Bright yellow sun
    sunGlowColor = 'rgba(253, 224, 71, 0.4)';
    planetOceanColor = '#0252cf'; // Clear deep blue
    planetLandColor = '#16a34a'; // Vibrant green
    statusText = '🌿 Earth is Thriving!';
    statusSubText = 'Wonderful job! Low footprint allows forests to grow and animals to return.';
    statusColor = 'text-green-400';
  }

  // Nunito Score status mapping
  let statusMessage = "Improving — Keep going!";
  let statusMsgColor = "#fbbf24";
  if (score <= 30) {
    statusMessage = "Critical — Take action now";
    statusMsgColor = "#ef4444";
  } else if (score > 30 && score <= 60) {
    statusMessage = "Improving — Keep going!";
    statusMsgColor = "#fbbf24";
  } else if (score > 60 && score <= 80) {
    statusMessage = "Good — You're making a difference";
    statusMsgColor = "#3b82f6";
  } else {
    statusMessage = "Excellent — Eco Champion!";
    statusMsgColor = "#22c55e";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/80 border border-green-500/20 rounded-3xl p-6 shadow-[0_0_15px_rgba(34,197,94,0.05)] flex flex-col items-center max-w-sm mx-auto"
    >
      <h3 className="text-lg font-bold text-white mb-0.5">Dynamic World Visualizer</h3>
      <p className="text-xs text-gray-500 mb-4">Real-time projection based on your score</p>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-square max-w-[280px]">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full overflow-hidden rounded-2xl"
          role="img"
          aria-label={`EcoSense world visualizer. Current eco score: ${score} out of 100`}
        >
          <title>Carbon Footprint World Visualizer - Score {score}/100</title>
          <defs>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap');
            </style>
            <clipPath id="planetClipCircle">
              <circle cx="150" cy="150" r="90" />
            </clipPath>
            <radialGradient id="sunGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor={sunColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sky background */}
          <motion.rect
            width="300"
            height="300"
            animate={{ fill: skyColor }}
            transition={{ duration: 1 }}
          />

          {/* Sun with outer glow */}
          <circle cx="240" cy="60" r="40" fill="url(#sunGlow)" />
          <motion.circle
            cx="240"
            cy="60"
            animate={{ r: isHigh ? 24 : isMed ? 20 : 16, fill: sunColor }}
            transition={{ duration: 1 }}
          />

          {/* Planet Body */}
          <g>
            {/* Atmosphere layer */}
            <motion.circle
              cx="150"
              cy="150"
              r="94"
              fill="none"
              stroke={isHigh ? '#22c55e' : isMed ? '#eab308' : '#ef4444'}
              strokeWidth="2"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Ocean */}
            <motion.circle
              cx="150"
              cy="150"
              r="90"
              animate={{ fill: planetOceanColor }}
              transition={{ duration: 1 }}
            />

            {/* Landmasses */}
            <g clipPath="url(#planetClipCircle)">
              {/* Continent 1 */}
              <motion.path
                d="M95 120 Q120 90 140 110 L160 150 Q165 170 145 180 L135 200 Q125 210 110 200 L100 170 Q80 150 95 120 Z"
                animate={{ fill: planetLandColor }}
                transition={{ duration: 1 }}
                opacity="0.9"
              />
              {/* Continent 2 */}
              <motion.path
                d="M175 110 Q195 100 215 125 L220 150 Q235 185 215 205 L195 215 Q180 190 175 160 Z"
                animate={{ fill: planetLandColor }}
                transition={{ duration: 1 }}
                opacity="0.9"
              />
              {/* Continent 3 */}
              <motion.path
                d="M130 75 Q150 65 170 85 L180 100 Q165 120 145 110 L135 95 Z"
                animate={{ fill: planetLandColor }}
                transition={{ duration: 1 }}
                opacity="0.85"
              />

              {/* Dynamic Trees placement */}
              {isLow && (
                <>
                  <Tree x={110} y={150} state="dead" delay={0.1} />
                  <Tree x={195} y={160} state="dead" delay={0.3} />
                  <Tree x={145} y={98} state="dead" delay={0.5} />
                </>
              )}
              {isMed && (
                <>
                  <Tree x={110} y={150} state="young" delay={0.1} />
                  <Tree x={195} y={160} state="young" delay={0.3} />
                  <Tree x={145} y={98} state="young" delay={0.5} />
                  <Tree x={125} y={170} state="young" delay={0.7} />
                  <Tree x={200} y={135} state="young" delay={0.9} />
                </>
              )}
              {isHigh && (
                <>
                  <Tree x={110} y={150} state="mature" delay={0.1} />
                  <Tree x={195} y={160} state="mature" delay={0.3} />
                  <Tree x={145} y={98} state="mature" delay={0.5} />
                  <Tree x={125} y={170} state="mature" delay={0.7} />
                  <Tree x={200} y={135} state="mature" delay={0.9} />
                  <Tree x={140} y={135} state="mature" delay={1.1} />
                  <Tree x={185} y={190} state="mature" delay={1.3} />
                  <Tree x={115} y={120} state="mature" delay={1.5} />
                </>
              )}

              {/* Dynamic Animals placement */}
              <Animal x={125} y={185} emoji="🦌" visible={isHigh} delay={0.4} />
              <Animal x={210} y={180} emoji="🐰" visible={isHigh} delay={0.8} />
              <Animal x={148} y={120} emoji="🐦" visible={isHigh} delay={1.2} />
              <Animal x={190} y={115} emoji="🦋" visible={isHigh || isMed} delay={0.6} />
            </g>
          </g>

          {/* Clouds (smog clouds for low score, white for others) */}
          <Cloud x={110} y={90} isPolluted={isLow} delay={0} />
          <Cloud x={220} y={120} isPolluted={isLow} delay={3.5} />
          <Cloud x={160} y={220} isPolluted={isLow} delay={7} />

          {/* Centered Score Label and Status Message */}
          <text x="150" y="260" fontFamily="Nunito, sans-serif" fontSize="14" fontWeight="700" fill="#ffffff" textAnchor="middle">
            🌍 Eco Score: {score}/100
          </text>
          <text x="150" y="278" fontFamily="Nunito, sans-serif" fontSize="10" fontWeight="700" fill={statusMsgColor} textAnchor="middle">
            {statusMessage}
          </text>
        </svg>
      </div>

      {/* Info Status footer */}
      <div className="w-full mt-4 text-center">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
          Greenness Score
        </div>
        <div className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-1.5">
          <span className={`${statusColor}`}>{score}</span>
          <span className="text-sm text-gray-500 font-bold">/ 100</span>
        </div>
        
        <div className="px-3 py-2.5 bg-gray-950/40 border border-gray-850/50 rounded-xl">
          <p className={`text-xs font-bold ${statusColor} mb-0.5`}>
            {statusText}
          </p>
          <p className="text-[10px] text-gray-400 leading-normal">
            {statusSubText}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

export default WorldVisualizer;
