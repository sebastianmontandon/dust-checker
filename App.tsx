import React, { useState, useMemo, useRef } from 'react';
import { FilterBar } from './components/FilterBar';
import { ItemTable } from './components/ItemTable';
import { AIAnalyst } from './components/AIAnalyst';
import { ProgressBar } from './components/ProgressBar';
import { Currency, FilterState, SaleType, SortState, TradeItem } from './types';
import { fetchTradeData } from './services/poeService';
import { analyzeMarket } from './services/geminiService';
import { CURRENCIES } from './constants';

const App: React.FC = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ratio puede ser editado manualmente. Si es '' es automático.
  const [currentRatio, setCurrentRatio] = useState<number | string>(150);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Use a Ref to track paused state inside the async loop, but useState for UI reactivity
  const isPausedRef = useRef(false);
  
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    currentItemName: ''
  });
  
  const [filters, setFilters] = useState<FilterState>({
    league: 'Keepers',
    currency: Currency.CHAOS_DIVINE, 
    saleType: SaleType.INSTANT,
    minDust: 0
  });

  const [sort, setSort] = useState<SortState>({
    field: 'dustRatio84Q20',
    direction: 'desc'
  });

  const togglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    isPausedRef.current = nextState;
    
    if (nextState) {
        setProgress(prev => ({ ...prev, currentItemName: "Scan paused" }));
    } else {
        setProgress(prev => ({ ...prev, currentItemName: "Processing..." }));
    }
  };

  // Check paused callback for the service
  const checkPausedCallback = async () => {
    while (isPausedRef.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleSearch = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Reset pause state on new search
    setIsPaused(false);
    isPausedRef.current = false;

    setLoading(true);
    setItems([]); 
    setAiAnalysis(null);
    setProgress({ current: 0, total: 0, currentItemName: '...' });
    
    try {
      // Pasamos el ratio actual si es un número válido, sino undefined (para que lo busque)
      const manualRatio = typeof currentRatio === 'number' ? currentRatio : Number(currentRatio);
      
      await fetchTradeData(
        filters, 
        (newItem) => {
          setItems(prevItems => [...prevItems, newItem]);
        },
        (current, total, itemName, ratio) => {
          setProgress({ current, total, currentItemName: itemName });
          if (ratio && ratio !== manualRatio) {
              setCurrentRatio(ratio);
          }
        },
        checkPausedCallback,
        controller.signal,
        manualRatio
      );
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error(error);
        }
    } finally {
        if (!controller.signal.aborted) {
            setLoading(false);
            setProgress(p => ({ ...p, currentItemName: 'Complete' }));
        }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setLoading(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setProgress({ current: 0, total: 0, currentItemName: "Scan stopped by user" });
  };

  const handleSort = (field: keyof TradeItem) => {
    setSort(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleAiAnalyze = async () => {
      if (items.length === 0) return;
      setAiLoading(true);
      const analysis = await analyzeMarket(items);
      setAiAnalysis(analysis);
      setAiLoading(false);
  };

  const adjustRatio = (amount: number) => {
    setCurrentRatio(prev => {
      const val = typeof prev === 'string' ? parseFloat(prev) || 0 : prev;
      return Math.max(1, val + amount);
    });
  };

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(i => i.name.toLowerCase().includes(lowerTerm));
    }
    
    result.sort((a, b) => {
        const valA = a[sort.field];
        const valB = b[sort.field];
        
        // Handle potentially undefined values
        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    return result;
  }, [items, searchTerm, sort]);

  // Icons for header
  const divineIcon = CURRENCIES.find(c => c.id === Currency.DIVINE)?.icon;
  const chaosIcon = CURRENCIES.find(c => c.id === Currency.CHAOS)?.icon;

  return (
    <div className="min-h-screen bg-poe-dark text-poe-text font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-poe-border pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-poe-gold tracking-widest drop-shadow-md text-center md:text-left">
              EXILE DUST CALCULATOR
            </h1>
            <p className="text-poe-goldDim text-sm uppercase tracking-widest text-center md:text-left mt-1">
              Efficiency Tool for <span className="text-white font-bold">{filters.league}</span>
            </p>
          </div>

          <div className="flex items-end gap-6">
            {/* Ratio Input */}
            <div className="flex flex-col items-center">
                <label className="text-[10px] uppercase text-poe-goldDim tracking-wider mb-1">Divine Ratio (Editable)</label>
                <div className="flex items-center bg-black/40 rounded-md px-3 py-1.5 border border-poe-border shadow-inner">
                    
                    {/* Divine Icon */}
                    <div className="flex items-center mr-3">
                      <span className="text-white font-bold mr-1">1</span>
                      <img src={divineIcon} alt="Divine" className="w-8 h-8 object-contain drop-shadow-lg" />
                      <span className="text-poe-gold mx-2 text-lg font-bold">=</span>
                    </div>

                    {/* Input Control */}
                    <div className="flex items-center bg-poe-dark rounded border border-poe-border/50">
                      <button 
                        onClick={() => adjustRatio(-1)}
                        className="w-8 h-8 flex items-center justify-center text-poe-gold hover:bg-poe-gold/10 hover:text-white transition-colors font-bold text-lg border-r border-poe-border/30"
                      >
                        -
                      </button>
                      <input 
                          type="number" 
                          value={currentRatio}
                          onChange={(e) => setCurrentRatio(e.target.value ? parseFloat(e.target.value) : '')}
                          className="w-16 bg-transparent text-center text-white font-mono font-bold focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={() => adjustRatio(1)}
                        className="w-8 h-8 flex items-center justify-center text-poe-gold hover:bg-poe-gold/10 hover:text-white transition-colors font-bold text-lg border-l border-poe-border/30"
                      >
                        +
                      </button>
                    </div>

                    {/* Chaos Icon */}
                    <div className="ml-3">
                      <img src={chaosIcon} alt="Chaos" className="w-8 h-8 object-contain drop-shadow-lg" />
                    </div>
                </div>
            </div>
          </div>
        </header>

        {/* Main Controls */}
        <FilterBar 
          filters={filters} 
          onChange={setFilters} 
          onSearch={handleSearch}
          onStop={handleStop}
          onPause={togglePause}
          isPaused={isPaused}
          loading={loading}
        />

        {/* Progress */}
        {loading && (
            <ProgressBar 
                current={progress.current} 
                total={progress.total} 
                currentItemName={progress.currentItemName}
            />
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6">
            {/* Search Filter */}
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Filter results by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-poe-panel border border-poe-border text-gray-200 p-3 pl-10 rounded shadow-inner focus:border-poe-gold focus:outline-none transition-colors focus:bg-poe-dark"
                />
                <div className="absolute left-3 top-3.5 pointer-events-none text-poe-goldDim">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
            </div>

            {/* Results Table */}
            <ItemTable 
                items={filteredItems} 
                sort={sort} 
                onSort={handleSort}
            />
        </div>

        {/* AI Analysis Section */}
        <AIAnalyst 
            analysis={aiAnalysis} 
            loading={aiLoading} 
            onAnalyze={handleAiAnalyze}
            hasData={items.length > 0}
        />

        {/* Footer */}
        <footer className="mt-12 text-center text-poe-goldDim text-xs tracking-widest opacity-50 pb-8">
          <p>Path of Exile is a registered trademark of Grinding Gear Games.</p>
          <p>This tool is not affiliated with GGG.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;