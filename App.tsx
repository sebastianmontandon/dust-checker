import React, { useState, useMemo } from 'react';
import { FilterBar } from './components/FilterBar';
import { ItemTable } from './components/ItemTable';
import { AIAnalyst } from './components/AIAnalyst';
import { Currency, FilterState, SaleType, SortState, TradeItem } from './types';
import { fetchTradeData } from './services/poeService';
import { analyzeMarket } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    league: 'Keepers',
    currency: Currency.CHAOS,
    saleType: SaleType.INSTANT,
    minDust: 0
  });

  const [sort, setSort] = useState<SortState>({
    field: 'dustRatio',
    direction: 'desc'
  });

  const handleSearch = async () => {
    setLoading(true);
    setAiAnalysis(null); // Reset AI analysis on new search
    try {
      const data = await fetchTradeData(filters);
      setItems(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (items.length === 0) return;
    setAiLoading(true);
    try {
      const result = await analyzeMarket(items);
      setAiAnalysis(result);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSort = (field: keyof TradeItem) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [items, sort]);

  return (
    <div className="min-h-screen bg-poe-dark text-poe-text p-4 md:p-8 font-sans selection:bg-poe-red selection:text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-poe-gold to-poe-goldDim mb-2">
            EXILE DUST CALCULATOR
          </h1>
          <p className="text-poe-goldDim text-sm uppercase tracking-[0.2em]">
            Keepers League Efficiency Tool
          </p>
        </header>

        {/* Main Controls */}
        <FilterBar 
          filters={filters} 
          onChange={setFilters} 
          onSearch={handleSearch} 
          loading={loading} 
        />

        {/* Results */}
        <div className="mb-6">
          <ItemTable 
            items={sortedItems} 
            sort={sort} 
            onSort={handleSort} 
          />
        </div>

        {/* AI Section */}
        <AIAnalyst 
          analysis={aiAnalysis} 
          loading={aiLoading} 
          onAnalyze={handleAnalyze}
          hasData={items.length > 0}
        />
        
        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 text-xs">
          <p>Datos simulados para demostración. API de Gemini requerida para análisis inteligente.</p>
          <p className="mt-1">Not affiliated with Grinding Gear Games.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;