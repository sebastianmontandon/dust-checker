import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  currentItemName: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, currentItemName }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full mb-6 bg-poe-panel border border-poe-border p-4 rounded-lg shadow-lg relative overflow-hidden">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div className="flex flex-col">
          <span className="text-xs text-poe-goldDim uppercase tracking-widest font-bold">Scan Status</span>
          <span className="text-poe-text font-serif text-sm">
            Processing: <span className="text-white font-bold">{currentItemName}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-serif text-poe-gold">{Math.round(percentage)}%</span>
          <span className="text-xs text-gray-500 block">{current} / {total} items</span>
        </div>
      </div>

      {/* Bar Background */}
      <div className="w-full bg-poe-dark h-3 rounded-full border border-poe-border overflow-hidden relative z-10">
        {/* Active Bar */}
        <div 
          className="h-full bg-gradient-to-r from-poe-goldDim to-poe-gold transition-all duration-500 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer Effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>

      {/* Decorative Background Glow */}
      <div 
        className="absolute top-0 left-0 h-full bg-poe-gold blur-[40px] opacity-5 transition-all duration-500 pointer-events-none"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};