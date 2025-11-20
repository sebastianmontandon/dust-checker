import React from 'react';

interface AIAnalystProps {
  analysis: string | null;
  loading: boolean;
  onAnalyze: () => void;
  hasData: boolean;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ analysis, loading, onAnalyze, hasData }) => {
  
  if (!hasData) return null;

  return (
    <div className="mt-8 bg-gradient-to-r from-poe-dark to-poe-panel border border-poe-gold/30 rounded-lg p-6 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-poe-gold blur-[100px] opacity-10 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif text-poe-gold flex items-center gap-2">
          <span className="text-2xl">🔮</span> Oracle of Kalguur (AI)
        </h2>
        <button 
          onClick={onAnalyze}
          disabled={loading}
          className="text-xs uppercase tracking-widest border border-poe-gold text-poe-gold hover:bg-poe-gold hover:text-black px-4 py-2 rounded transition-all"
        >
          {loading ? "Consulting..." : "Analyze Market"}
        </button>
      </div>

      <div className="min-h-[80px] text-gray-300 leading-relaxed font-light">
        {loading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 bg-poe-gold rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-poe-gold rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-poe-gold rounded-full animate-bounce delay-150"></div>
            <span className="text-sm text-poe-goldDim">Interpreting the stars...</span>
          </div>
        ) : analysis ? (
          <div className="prose prose-invert max-w-none">
            <p className="italic border-l-2 border-poe-red pl-4">{analysis}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Click 'Analyze Market' to get an AI recommendation on what to disenchant.</p>
        )}
      </div>
    </div>
  );
};