import React, { useState, useMemo, useRef } from 'react';
import { FilterBar } from './components/FilterBar';
import { ItemTable } from './components/ItemTable';
import { AIAnalyst } from './components/AIAnalyst';
import { ProgressBar } from './components/ProgressBar';
import { Currency, FilterState, SaleType, SortState, TradeItem } from './types';
import { fetchTradeData } from './services/poeService';
import { analyzeMarket } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Referencia al controlador de aborto para cancelar búsquedas
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Estado para la barra de progreso
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    currentItemName: ''
  });
  
  const [filters, setFilters] = useState<FilterState>({
    league: 'Keepers',
    currency: Currency.CHAOS,
    saleType: SaleType.INSTANT,
    minDust: 0
  });

  const [sort, setSort] = useState<SortState>({
    field: 'dustRatio84Q20',
    direction: 'desc'
  });

  const handleSearch = async () => {
    // Si hay una búsqueda anterior corriendo, la cancelamos primero
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Creamos un nuevo controlador
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setItems([]); // Limpiamos tabla anterior
    setAiAnalysis(null);
    setProgress({ current: 0, total: 0, currentItemName: 'Iniciando...' });
    
    try {
      // Pasamos la señal de aborto al servicio
      await fetchTradeData(
        filters, 
        (newItem) => {
          setItems(prevItems => [...prevItems, newItem]);
        },
        (current, total, itemName) => {
          setProgress({ current, total, currentItemName: itemName });
        },
        controller.signal
      );
    } catch (error) {
      console.error("Search failed or aborted", error);
    } finally {
      // Solo quitamos el loading si el controlador actual es el que terminó
      // (Para evitar condiciones de carrera si el usuario spamea buscar)
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleStopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setProgress(prev => ({ ...prev, currentItemName: 'Búsqueda detenida por el usuario' }));
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

  const sortedAndFilteredItems = useMemo(() => {
    // 1. Filtrar por término de búsqueda
    let result = items;
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Ordenar
    return result.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [items, sort, searchTerm]);

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
          onStop={handleStopSearch}
          loading={loading} 
        />

        {/* Progress Bar (Only visible when loading or paused with items) */}
        {(loading || items.length > 0) && progress.total > 0 && (
          <ProgressBar 
            current={progress.current} 
            total={progress.total} 
            currentItemName={progress.currentItemName} 
          />
        )}

        {/* Search Input */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-poe-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Filtrar resultados por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-poe-panel border border-poe-border text-gray-200 p-3 pl-10 rounded focus:border-poe-gold focus:outline-none shadow-inner transition-colors"
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <ItemTable 
            items={sortedAndFilteredItems} 
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
          <p>Nota: El escaneo es intencionalmente lento para cumplir con las normas de la API de Grinding Gear Games.</p>
          <p className="mt-1">Not affiliated with Grinding Gear Games.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;