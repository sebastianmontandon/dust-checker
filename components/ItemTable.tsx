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

  const HeaderCell = ({ field, label, align = 'left' }: { field: keyof TradeItem, label: string, align?: string }) => (
    <th 
      className={`py-4 px-4 text-${align} text-poe-text uppercase text-xs font-bold cursor-pointer hover:text-poe-gold transition-colors border-b border-poe-border bg-poe-panel bg-opacity-50`}
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
            <HeaderCell field="name" label="Objeto" />
            <HeaderCell field="priceAmount" label="Precio Promedio (Top 10)" align="right" />
            <HeaderCell field="dustValue" label="Dust Total" align="right" />
            <HeaderCell field="dustRatio" label="Ratio (Dust/Costo)" align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-poe-border">
          {items.map((item) => {
            const currencyIcon = CURRENCIES.find(c => c.id === item.priceCurrency)?.icon;
            const isGreatDeal = item.dustRatio > 6000; // Threshold for highlighting

            return (
              <tr key={item.id} className="hover:bg-poe-panel transition-colors duration-150 group">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {item.icon && <img src={item.icon} alt="" className="w-8 h-8 object-contain" />}
                    <div>
                      <div className="font-serif text-poe-gold text-lg group-hover:text-white transition-colors flex items-center gap-2">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">Listings: {item.listingCount}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-gray-300">
                  <div className="flex items-center justify-end gap-2">
                    {item.priceAmount}
                    {currencyIcon ? (
                      <img src={currencyIcon} alt="curr" className="w-6 h-6" />
                    ) : (
                      <span className="text-xs">{item.priceCurrency}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-blue-300">
                  {item.dustValue.toLocaleString()} ✨
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-bold font-mono py-1 px-2 rounded ${isGreatDeal ? 'bg-green-900 text-green-300' : 'text-gray-400'}`}>
                    {item.dustRatio.toLocaleString()}
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