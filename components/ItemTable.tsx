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

  const HeaderCell = ({ field, label, align = 'left', className='' }: { field: keyof TradeItem, label: string, align?: string, className?: string }) => (
    <th 
      className={`py-3 px-3 text-${align} text-poe-text uppercase text-xs font-bold cursor-pointer hover:text-poe-gold transition-colors border-b border-poe-border bg-poe-panel bg-opacity-50 ${className}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        {getSortIcon(field)}
      </div>
    </th>
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 italic border border-poe-border rounded-lg bg-poe-panel">
        No se encontraron datos. Inicia una búsqueda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-poe-border shadow-xl">
      <table className="min-w-full bg-poe-dark">
        <thead>
          <tr>
            <HeaderCell field="name" label="Objeto" className="border-r border-poe-border" />
            <HeaderCell field="priceAmount" label="Precio (Top 10)" align="right" className="border-r border-poe-border" />
            
            {/* Grupo ILVL 84 */}
            <th className="py-2 px-2 text-center text-poe-goldDim uppercase text-[10px] font-bold border-b border-poe-border bg-poe-panel bg-opacity-30" colSpan={2}>
              Base (ilvl 84+)
            </th>

            {/* Grupo ILVL 84 + Q20 */}
            <th className="py-2 px-2 text-center text-poe-gold uppercase text-[10px] font-bold border-b border-poe-border bg-poe-panel bg-opacity-30" colSpan={2}>
              Quality 20% (ilvl 84+)
            </th>
          </tr>
          <tr>
            {/* Subheaders vacíos para name/price */}
            <th className="bg-poe-dark border-b border-poe-border border-r border-poe-border"></th>
            <th className="bg-poe-dark border-b border-poe-border border-r border-poe-border"></th>

            <HeaderCell field="dustValIlvl84" label="Dust" align="right" />
            <HeaderCell field="dustRatio84" label="Ratio" align="right" className="border-r border-poe-border" />

            <HeaderCell field="dustValIlvl84Q20" label="Dust" align="right" />
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
                  <div className="flex items-center gap-2">
                    {item.icon && <img src={item.icon} alt="" className="w-8 h-8 object-contain" />}
                    <div>
                      <div className="font-serif text-poe-gold text-sm group-hover:text-white transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500">Listings: {item.listingCount}</div>
                    </div>
                  </div>
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

                {/* Base Values */}
                <td className="py-3 px-3 text-right font-mono text-blue-300/70 text-sm">
                  {item.dustValIlvl84.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right border-r border-poe-border">
                  <span className={`font-mono text-sm ${item.dustRatio84 > 5000 ? 'text-gray-200' : 'text-gray-500'}`}>
                    {item.dustRatio84.toLocaleString()}
                  </span>
                </td>

                {/* Q20 Values */}
                <td className="py-3 px-3 text-right font-mono text-blue-300 text-sm">
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