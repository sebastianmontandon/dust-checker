import React from 'react';
import { CURRENCIES, LEAGUES, SALE_TYPES } from '../constants';
import { Currency, FilterState, SaleType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onSearch: () => void;
  onStop: () => void;
  loading: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onSearch, onStop, loading }) => {
  
  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-poe-panel border border-poe-border p-6 rounded-lg shadow-2xl mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* League Selector */}
        <div className="space-y-2">
          <label className="text-poe-gold text-sm font-serif tracking-wider">Liga</label>
          <select 
            className="w-full bg-poe-dark border border-poe-border text-gray-200 p-2 rounded focus:border-poe-gold focus:outline-none"
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
        <div className="space-y-2">
          <label className="text-poe-gold text-sm font-serif tracking-wider">Moneda de Pago</label>
          <div className="relative">
            <select 
              className="w-full bg-poe-dark border border-poe-border text-gray-200 p-2 pl-10 rounded focus:border-poe-gold focus:outline-none appearance-none"
              value={filters.currency}
              onChange={(e) => handleChange('currency', e.target.value as Currency)}
              disabled={loading}
            >
              {CURRENCIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <img 
                src={CURRENCIES.find(c => c.id === filters.currency)?.icon} 
                alt="currency" 
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Sale Type Selector */}
        <div className="space-y-2">
          <label className="text-poe-gold text-sm font-serif tracking-wider">Tipo de Venta</label>
          <select 
            className="w-full bg-poe-dark border border-poe-border text-gray-200 p-2 rounded focus:border-poe-gold focus:outline-none"
            value={filters.saleType}
            onChange={(e) => handleChange('saleType', e.target.value as SaleType)}
            disabled={loading}
          >
            {SALE_TYPES.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          {loading ? (
            <button
              onClick={onStop}
              className="w-full font-serif tracking-widest font-bold py-2 px-4 rounded transition-all duration-300 bg-red-900/80 text-red-200 hover:bg-red-800 border border-poe-red shadow-[0_0_10px_rgba(209,58,58,0.3)] hover:shadow-[0_0_20px_rgba(209,58,58,0.5)] flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              DETENER
            </button>
          ) : (
            <button
              onClick={onSearch}
              className="w-full font-serif tracking-widest font-bold py-2 px-4 rounded transition-all duration-300 bg-gradient-to-b from-poe-gold to-poe-goldDim text-black hover:scale-[1.02] hover:brightness-110 shadow-[0_0_15px_rgba(200,170,109,0.3)]"
            >
              BUSCAR OPORTUNIDADES
            </button>
          )}
        </div>

      </div>
    </div>
  );
};