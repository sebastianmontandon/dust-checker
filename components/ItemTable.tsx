import React from 'react';
import { CURRENCIES } from '../constants';
import { SortState, TradeItem } from '../types';

interface ItemTableProps {
  items: TradeItem[];
  sort: SortState;
  onSort: (field: keyof TradeItem) => void;
}

export const ItemTable: React.FC<ItemTableProps> = ({ items, sort, onSort }) => {

  const getSortIcon = (field: keyof TradeItem) => {
    if (sort.field !== field) return <span className="opacity-20 ml-1">↕</span>;
    return sort.direction === 'asc' ? <span className="text-poe-gold ml-1">↑</span> : <span className="text-poe-gold ml-1">↓</span>;
  };

  const HeaderCell = ({ field, label, align = 'left', className='' }: { field?: keyof TradeItem, label: string, align?: string, className?: string }) => (
    <th 
      className={`py-3 px-3 text-${align} text-poe-text uppercase text-xs font-bold border-b border-poe-border bg-poe-panel bg-opacity-50 ${field ? 'cursor-pointer hover:text-poe-gold transition-colors' : ''} ${className}`}
      onClick={() => field && onSort(field)}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : 'justify-start'} ${align === 'center' ? 'justify-center' : ''}`}>
        {label}
        {field && getSortIcon(field)}
      </div>
    </th>
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 italic border border-poe-border rounded-lg bg-poe-panel">
        No data found. Start a scan.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-poe-border shadow-xl">
      <table className="min-w-full bg-poe-dark">
        <thead>
          <tr>
            <HeaderCell field="name" label="Item" className="border-r border-poe-border" />
            <HeaderCell label="Trade" align="center" className="border-r border-poe-border w-16" />
            <HeaderCell field="priceAmount" label="Price (Top 10)" align="right" className="border-r border-poe-border" />
            
            {/* Grupo ILVL 84 - Hidden on Mobile */}
            <th className="hidden md:table-cell py-2 px-2 text-center text-poe-goldDim uppercase text-[10px] font-bold border-b border-poe-border bg-poe-panel bg-opacity-30" colSpan={2}>
              Base (ilvl 84+)
            </th>

            {/* Grupo ILVL 84 + Q20 - 2 Cols on Desktop, 1 on Mobile */}
            {/* On mobile, this header spans 1 col (the visible Ratio col). On desktop, it spans 2 (Dust + Ratio) */}
            <th className="py-2 px-2 text-center text-poe-gold uppercase text-[10px] font-bold border-b border-poe-border bg-poe-panel bg-opacity-30 md:col-span-2" colSpan={2}>
               <span className="md:hidden">Q20 Ratio</span>
               <span className="hidden md:inline">Quality 20% (ilvl 84+)</span>
            </th>
          </tr>
          <tr>
            {/* Subheaders vacíos para name/trade/price */}
            <th className="bg-poe-dark border-b border-poe-border border-r border-poe-border"></th>
            <th className="bg-poe-dark border-b border-poe-border border-r border-poe-border"></th>
            <th className="bg-poe-dark border-b border-poe-border border-r border-poe-border"></th>

            {/* Base Columns - Hidden on Mobile */}
            <HeaderCell field="dustValIlvl84" label="Dust" align="right" className="hidden md:table-cell" />
            <HeaderCell field="dustRatio84" label="Ratio" align="right" className="hidden md:table-cell border-r border-poe-border" />

            {/* Q20 Columns */}
            <HeaderCell field="dustValIlvl84Q20" label="Dust" align="right" className="hidden md:table-cell" />
            <HeaderCell field="dustRatio84Q20" label="Ratio" align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-poe-border">
          {items.map((item) => {
            const currencyIcon = CURRENCIES.find(c => c.id === item.priceCurrency)?.icon;
            const isGreatDeal = item.dustRatio84Q20 > 8000; // Threshold for highlighting

            return (
              <tr key={item.id} className="hover:bg-poe-panel transition-colors duration-150 group">
                <td className="py-3 px-4 border-r border-poe-border">
                  <div className="flex items-center gap-3">
                    {item.icon && <img src={item.icon} alt="" className="w-8 h-8 object-contain" />}
                    <div>
                      <div className="font-serif text-poe-gold text-sm group-hover:text-white transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500">Listings: {item.listingCount}</div>
                    </div>
                  </div>
                </td>

                {/* Trade Column */}
                <td className="py-3 px-2 border-r border-poe-border text-center align-middle">
                   {item.tradeUrl ? (
                      <a 
                        href={item.tradeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        // Green Button Style (PoE Buy Button Aesthetic)
                        className="relative inline-flex items-center justify-center w-9 h-9 bg-gradient-to-b from-[#0f1e0f] to-[#050a05] border border-[#2f452f] rounded-[3px] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] hover:brightness-125 hover:border-[#4a6b4a] active:translate-y-[1px] transition-all duration-150 group/btn"
                        title="Trade on Path of Exile"
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#e2c08d] drop-shadow-md transform group-hover/btn:scale-110 transition-transform" fill="currentColor">
                           {/* Exchange Icon (Two arrows) */}
                           <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                </td>

                <td className="py-3 px-4 text-right font-mono text-gray-300 border-r border-poe-border bg-poe-dark/30">
                  <div className="flex items-center justify-end gap-2">
                    {item.priceAmount}
                    {currencyIcon ? (
                      <img src={currencyIcon} alt="curr" className="w-5 h-5" />
                    ) : (
                      <span className="text-xs">{item.priceCurrency}</span>
                    )}
                  </div>
                </td>

                {/* Base Values - Hidden on Mobile */}
                <td className="hidden md:table-cell py-3 px-3 text-right font-mono text-blue-300/70 text-sm">
                  {item.dustValIlvl84.toLocaleString()}
                </td>
                <td className="hidden md:table-cell py-3 px-3 text-right border-r border-poe-border">
                  <span className={`font-mono text-sm ${item.dustRatio84 > 5000 ? 'text-gray-200' : 'text-gray-500'}`}>
                    {item.dustRatio84.toLocaleString()}
                  </span>
                </td>

                {/* Q20 Values */}
                <td className="hidden md:table-cell py-3 px-3 text-right font-mono text-blue-300 text-sm">
                  {item.dustValIlvl84Q20.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`font-bold font-mono text-sm py-1 px-2 rounded ${isGreatDeal ? 'bg-green-900/50 text-green-300' : 'text-gray-400'}`}>
                    {item.dustRatio84Q20.toLocaleString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};