import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FilterBar } from './components/FilterBar';
import { ItemTable } from './components/ItemTable';
import { ProgressBar } from './components/ProgressBar';
import { Currency, FilterState, SaleType, SortState, TradeItem } from './types';
import { fetchTradeData } from './services/poeService';
import { CURRENCIES } from './constants';

const App: React.FC = () => {
  // 1. User Preference for Local Storage (Default: true)
  const [saveDataLocally, setSaveDataLocally] = useState(() => {
    const saved = localStorage.getItem('save_data_locally');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 2. Initialize Items (Lazy load only if preference is enabled)
  const [items, setItems] = useState<TradeItem[]>(() => {
    if (localStorage.getItem('save_data_locally') !== 'false') { // Default true logic matches above
        const saved = localStorage.getItem('dust_items');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Error parsing local storage items", e);
            return [];
        }
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [githubStars, setGithubStars] = useState<number | null>(null);
  
  // 3. Initialize Ratio
  const [currentRatio, setCurrentRatio] = useState<number | string>(() => {
    if (localStorage.getItem('save_data_locally') !== 'false') {
        const saved = localStorage.getItem('dust_ratio');
        return saved ? JSON.parse(saved) : 150;
    }
    return 150;
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
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

  // Fetch GitHub Stars
  useEffect(() => {
    fetch('https://api.github.com/repos/sebastianmontandon/dust-checker')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setGithubStars(data.stargazers_count);
        }
      })
      .catch(err => console.error("Failed to fetch stars", err));
  }, []);

  // 4. Persistence Effect
  useEffect(() => {
    localStorage.setItem('save_data_locally', JSON.stringify(saveDataLocally));
    
    if (saveDataLocally) {
        localStorage.setItem('dust_items', JSON.stringify(items));
        localStorage.setItem('dust_ratio', JSON.stringify(currentRatio));
    } else {
        localStorage.removeItem('dust_items');
        localStorage.removeItem('dust_ratio');
    }
  }, [items, currentRatio, saveDataLocally]);

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
    
    setIsPaused(false);
    isPausedRef.current = false;

    setLoading(true);
    setItems([]); 
    setProgress({ current: 0, total: 0, currentItemName: '...' });
    
    try {
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
        
        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    return result;
  }, [items, searchTerm, sort]);

  const divineIcon = CURRENCIES.find(c => c.id === Currency.DIVINE)?.icon;
  const chaosIcon = CURRENCIES.find(c => c.id === Currency.CHAOS)?.icon;

  return (
    <div className="min-h-screen bg-poe-dark text-poe-text font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-poe-border pb-6">
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-3xl md:text-4xl font-serif text-poe-gold tracking-widest drop-shadow-md text-center md:text-left">
                EXILE DUST CALCULATOR
              </h1>
              <p className="text-poe-goldDim text-sm uppercase tracking-widest text-center md:text-left mt-1">
                Efficiency Tool for <span className="text-white font-bold">{filters.league}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center h-full">
            {/* Ratio Input */}
            <div className="flex flex-col items-center">
                <label className="text-[10px] uppercase text-poe-goldDim tracking-wider mb-1">Divine Ratio (Editable)</label>
                <div className="flex items-center bg-black/40 rounded-md px-3 py-1.5 border border-poe-border shadow-inner h-10">
                    
                    <div className="flex items-center mr-3">
                      <span className="text-white font-bold mr-1">1</span>
                      <img src={divineIcon} alt="Divine" className="w-8 h-8 object-contain drop-shadow-lg" />
                      <span className="text-poe-gold mx-2 text-lg font-bold">=</span>
                    </div>

                    <div className="flex items-center bg-poe-dark rounded border border-poe-border/50 h-8">
                      <button 
                        onClick={() => adjustRatio(-1)}
                        className="w-8 h-full flex items-center justify-center text-poe-gold hover:bg-poe-gold/10 hover:text-white transition-colors font-bold text-lg border-r border-poe-border/30"
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
                        className="w-8 h-full flex items-center justify-center text-poe-gold hover:bg-poe-gold/10 hover:text-white transition-colors font-bold text-lg border-l border-poe-border/30"
                      >
                        +
                      </button>
                    </div>

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
          hasData={items.length > 0}
          saveDataLocally={saveDataLocally}
          onToggleSaveData={setSaveDataLocally}
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
                    className="w-full bg-poe-panel border border-poe-border text-gray-200 p-3 pl-10 rounded shadow-inner focus:border-poe-gold focus:outline-none transition-colors focus:bg-poe-dark h-12"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-poe-goldDim">
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

        {/* Community Project Section */}
        <div className="mt-12 bg-poe-panel border border-poe-border p-8 rounded-lg text-center shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-poe-goldDim to-transparent opacity-50"></div>
           
           <h2 className="text-poe-gold font-serif text-xl mb-4 tracking-widest flex items-center justify-center gap-3">
             {/* Star Icon (Gold/Black Theme) */}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-poe-gold">
               <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
             </svg>
             COMMUNITY PROJECT
           </h2>
           
           <p className="text-gray-300 text-base mb-8 max-w-3xl mx-auto leading-7">
             This tool was created to help the Path of Exile community purely for non-profit purposes. 
             Our goal is to help you find the best value for your dust. 
             If you wish to propose improvements, report bugs, or contribute, please visit the repository.
             <br/><br/>
             <span className="text-poe-gold font-medium">Support the project by giving it a star!</span>
           </p>

           <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             {/* Repository Button */}
             <a 
               href="https://github.com/sebastianmontandon/dust-checker" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-3 px-8 py-3 border border-poe-goldDim text-poe-gold hover:bg-poe-gold hover:text-black transition-all duration-300 rounded font-serif tracking-wider text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(200,170,109,0.4)]"
             >
               <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
               GITHUB REPOSITORY
             </a>
             
             {/* Custom Star Button */}
             <a
               href="https://github.com/sebastianmontandon/dust-checker"
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-3 px-8 py-3 border border-poe-goldDim text-poe-gold hover:bg-poe-gold hover:text-black transition-all duration-300 rounded font-serif tracking-wider text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(200,170,109,0.4)]"
             >
               <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
               STAR PROJECT {githubStars !== null ? `(${githubStars})` : ''}
             </a>
           </div>
        </div>

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