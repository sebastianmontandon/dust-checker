import React from 'react';
import { CURRENCIES, LEAGUES, SALE_TYPES } from '../constants';
import { Currency, FilterState, SaleType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onSearch: () => void;
  onStop: () => void;
  onPause: () => void;
  isPaused: boolean;
  loading: boolean;
  hasData: boolean;
  saveDataLocally: boolean;
  onToggleSaveData: (value: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  onChange, 
  onSearch, 
  onStop, 
  onPause, 
  isPaused, 
  loading, 
  hasData,
  saveDataLocally,
  onToggleSaveData
}) => {
  
  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-poe-panel border border-poe-border p-6 rounded-lg shadow-2xl mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        
        {/* League Selector */}
        <div className="space-y-2 w-full h-16 flex flex-col justify-end">
          <label className="text-poe-gold text-sm font-serif tracking-wider block">League</label>
          <select 
            className="w-full h-10 bg-poe-dark border border-poe-border text-gray-200 px-2 rounded focus:border-poe-gold focus:outline-none"
            value={filters.league}
            onChange={(e) => handleChange('league', e.target.value)}
            disabled={loading}
          >
            {LEAGUES.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Currency Selector */}
        <div className="space-y-2 w-full h-16 flex flex-col justify-end">
          <label className="text-poe-gold text-sm font-serif tracking-wider block">Payment Currency</label>
          <div className="relative">
            <select 
              className="w-full h-10 bg-poe-dark border border-poe-border text-gray-200 px-2 pl-10 rounded focus:border-poe-gold focus:outline-none appearance-none pr-10"
              value={filters.currency}
              onChange={(e) => handleChange('currency', e.target.value as Currency)}
              disabled={loading}
            >
              {CURRENCIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {/* Currency Icon Left */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              <img 
                src={CURRENCIES.find(c => c.id === filters.currency)?.icon} 
                alt="currency" 
                className="w-5 h-5"
              />
            </div>
            {/* Dropdown Arrow Right */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sale Type Selector */}
        <div className="space-y-2 w-full h-16 flex flex-col justify-end">
          <label className="text-poe-gold text-sm font-serif tracking-wider block">Sale Type</label>
          <select 
            className="w-full h-10 bg-poe-dark border border-poe-border text-gray-200 px-2 rounded focus:border-poe-gold focus:outline-none"
            value={filters.saleType}
            onChange={(e) => handleChange('saleType', e.target.value as SaleType)}
            disabled={loading}
          >
            {SALE_TYPES.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons & Toggle */}
        <div className="space-y-2 w-full h-16 flex flex-col justify-end">
          {/* Header Row: Label + Toggle */}
          <div className="flex justify-between items-center">
             <label className="text-poe-gold text-sm font-serif tracking-wider block">Action</label>
             
             {/* Save Data Toggle */}
             <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => onToggleSaveData(!saveDataLocally)}>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${saveDataLocally ? 'text-poe-gold' : 'text-gray-600 group-hover:text-gray-400'}`}>
                   Save Data
                </span>
                <div className={`w-9 h-5 rounded-full border transition-colors relative ${saveDataLocally ? 'bg-poe-dark border-poe-gold' : 'bg-poe-dark border-gray-700'}`}>
                   <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-200 ${saveDataLocally ? 'bg-poe-gold left-5' : 'bg-gray-600 left-1'}`}></div>
                </div>
             </div>
          </div>

          <div className="flex items-stretch gap-2 h-10">
            {loading ? (
              <>
                {/* STOP BUTTON */}
                <button
                  onClick={onStop}
                  className="flex-1 font-serif tracking-widest font-bold px-2 rounded-[3px] transition-all duration-150 bg-gradient-to-b from-[#2a0b0b] to-[#1a0505] border border-[#5c1c1c] text-[#ff6666] hover:brightness-125 hover:border-red-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 text-xs"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  STOP
                </button>
                
                {/* PAUSE / RESUME BUTTON */}
                <button
                  onClick={onPause}
                  className={`flex-1 font-serif tracking-widest font-bold px-2 rounded-[3px] transition-all duration-150 border flex items-center justify-center gap-2 text-xs shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] hover:brightness-125
                    ${isPaused 
                      ? 'bg-gradient-to-b from-[#102b10] to-[#051605] border-[#2f452f] text-[#77eeaa] hover:border-[#4a6b4a]' // Resume Style (Green)
                      : 'bg-gradient-to-b from-[#2b2210] to-[#161105] border-[#665220] text-[#eebb77] hover:border-[#c8aa6d]' // Pause Style (Amber)
                    }`}
                >
                   {isPaused ? (
                     <>
                       <span>▶</span> RESUME
                     </>
                   ) : (
                     <>
                       <span>⏸</span> PAUSE
                     </>
                   )}
                </button>
              </>
            ) : (
              <button
                onClick={onSearch}
                className={`w-full h-full font-serif tracking-widest font-bold rounded-[3px] transition-all duration-150 flex items-center justify-center gap-2 text-xs shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] hover:scale-[1.01] active:scale-[0.99]
                   ${hasData 
                     ? 'bg-gradient-to-b from-[#0f1e0f] to-[#050a05] border border-[#2f452f] text-[#90c490] hover:brightness-125 hover:border-[#4a6b4a] shadow-[0_0_15px_rgba(0,0,0,0.3)]' // Update Style (Deep Green)
                     : 'bg-gradient-to-b from-poe-gold to-poe-goldDim text-black border border-poe-gold hover:brightness-110 shadow-[0_0_15px_rgba(200,170,109,0.3)]' // Scan Style (Gold)
                   }
                `}
              >
                {hasData ? (
                   <>
                     <svg className="w-4 h-4 animate-spin-slow text-[#90c490]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     UPDATE MARKET DATA
                   </>
                ) : (
                   "SCAN MARKET"
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};