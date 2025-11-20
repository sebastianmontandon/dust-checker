import { Currency, FilterState, SaleType, TradeItem } from '../types';
import { DUST_DATABASE } from '../constants';

const POE_TRADE_API = 'https://www.pathofexile.com/api/trade';

// PROXY: Necesario para evitar el bloqueo CORS en navegadores (Client-side only)
// Enruta la petición a través de un servidor intermedio que añade los headers correctos.
const CORS_PROXY = 'https://corsproxy.io/?';

// Headers requeridos
const HEADERS = {
  'Content-Type': 'application/json',
};

// Función auxiliar para pausar la ejecución (evitar rate limits)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mapea el tipo de venta seleccionado a los filtros de la API de PoE
 * basándose en los ejemplos proporcionados (securable, available, online).
 */
const getStatusOption = (saleType: SaleType): string => {
  switch (saleType) {
    case SaleType.INSTANT: return 'securable'; // Instant Buyout Only
    case SaleType.INSTANT_AND_PERSON: return 'available'; // Instant Buyout and In Person
    case SaleType.PERSON: return 'online'; // In Person Trade Only
    case SaleType.ANY: return 'any'; // Any
    default: return 'online';
  }
};

/**
 * Construye la URL con Proxy para evitar CORS
 */
const getProxiedUrl = (targetUrl: string): string => {
  return `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
};

/**
 * Realiza la búsqueda de un item específico para obtener su ID de búsqueda y IDs de resultados.
 */
const searchItem = async (league: string, name: string, type: string, saleType: SaleType, currency: Currency) => {
  const targetUrl = `${POE_TRADE_API}/search/${league}`;
  const url = getProxiedUrl(targetUrl);
  
  // Estructura exacta basada en los ejemplos proporcionados
  const body = {
    query: {
      status: { 
        option: getStatusOption(saleType) 
      },
      name: name,
      type: type,
      stats: [
        {
          type: "and",
          filters: []
        }
      ],
      filters: {
        trade_filters: {
          filters: {
            price: {
              option: currency 
            }
          }
        }
      }
    },
    sort: { 
      price: "asc" 
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Search Error (${response.status}): ${errText}`);
  }

  return await response.json(); 
};

/**
 * Obtiene los detalles del item (precio, etc) usando los IDs obtenidos en la búsqueda.
 */
const fetchItemDetails = async (ids: string[], queryId: string): Promise<any> => {
  // Reducimos a top 10 para ser más ligeros y obtener el promedio
  const idsToFetch = ids.slice(0, 10).join(',');
  const targetUrl = `${POE_TRADE_API}/fetch/${idsToFetch}?query=${queryId}`;
  const url = getProxiedUrl(targetUrl);

  const response = await fetch(url, { headers: HEADERS });

  if (!response.ok) {
    throw new Error(`Fetch Details Error: ${response.status}`);
  }

  return await response.json(); 
};

export const fetchTradeData = async (
  filter: FilterState, 
  onItemLoaded: (item: TradeItem) => void,
  onProgress: (current: number, total: number, itemName: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  
  // Escanear TODOS los items de la base de datos
  const itemsToScan = DUST_DATABASE;
  const totalItems = itemsToScan.length;

  console.log(`Iniciando escaneo de mercado en ${filter.league} para ${totalItems} items...`);

  // Iteramos sobre todos los items
  for (let i = 0; i < itemsToScan.length; i++) {
    
    // Check for abort before starting iteration
    if (signal?.aborted) {
      console.log("Search aborted by user.");
      break;
    }

    const dbItem = itemsToScan[i];
    
    // Notificar progreso al inicio de la iteración
    onProgress(i + 1, totalItems, dbItem.name);

    try {
      // ESTRATEGIA ANTI-BAN ULTRA CONSERVADORA
      // GGG tiene límites estrictos por IP. Para listas largas (>50 items), debemos ser muy lentos.
      
      // 1. Jitter aleatorio para parecer más humano (8s a 10s)
      const randomJitter = Math.floor(Math.random() * 2000);
      await sleep(8000 + randomJitter); 

      if (signal?.aborted) break; // Check after sleep

      // 2. Batch Cooling Agresivo: Cada 4 items, pausamos 30 segundos extra.
      if (i > 0 && i % 4 === 0) {
         console.log("🧊 Enfriando API (Pausa preventiva larga)...");
         onProgress(i + 1, totalItems, `${dbItem.name} (Enfriando API 30s...)`);
         await sleep(30000);
      }

      if (signal?.aborted) break; // Check after cooling

      // Búsqueda REAL a través del Proxy
      const searchResult = await searchItem(
        filter.league, 
        dbItem.name, 
        dbItem.baseType, 
        filter.saleType,
        filter.currency
      );

      let avgPrice = 0;
      let count = 0;
      let icon = undefined;

      if (searchResult.result && searchResult.result.length > 0) {
        // Pequeña pausa entre search y fetch details
        await sleep(2000);
        if (signal?.aborted) break; 
        
        const detailsData = await fetchItemDetails(searchResult.result, searchResult.id);
        const listings = detailsData.result;
        
        if (listings && listings.length > 0) {
          // Calcular precio promedio real de los top 10 listings
          const totalPrice = listings.reduce((sum: number, item: any) => {
             return sum + (item.listing?.price?.amount || 0);
          }, 0);
          
          avgPrice = totalPrice / listings.length;
          count = searchResult.total;
          icon = listings[0].item.icon;
        }
      }

      // Si no hay listings, el precio es 0
      const formattedAvgPrice = parseFloat(avgPrice.toFixed(2));
      
      // Calcular ratios para ambos casos
      const dustRatio84 = formattedAvgPrice > 0 ? dbItem.dustValIlvl84 / formattedAvgPrice : 0;
      const dustRatio84Q20 = formattedAvgPrice > 0 ? dbItem.dustValIlvl84Q20 / formattedAvgPrice : 0;

      // Llamamos al callback para actualizar la UI inmediatamente
      onItemLoaded({
        id: `real-${i}`,
        name: dbItem.name,
        priceAmount: formattedAvgPrice,
        priceCurrency: filter.currency, 
        listingCount: count,
        
        // Valores base
        dustValIlvl84: dbItem.dustValIlvl84,
        dustRatio84: parseFloat(dustRatio84.toFixed(2)),
        
        // Valores Q20
        dustValIlvl84Q20: dbItem.dustValIlvl84Q20,
        dustRatio84Q20: parseFloat(dustRatio84Q20.toFixed(2)),

        icon: icon
      });

    } catch (error: any) {
      if (signal?.aborted) break;

      console.error(`Error obteniendo datos REALES para ${dbItem.name}:`, error);
      
      // MANEJO INTELIGENTE DE RATE LIMIT (429)
      if (error.message && error.message.includes('429')) {
        console.warn("⚠️ RATE LIMIT ALCANZADO (429). Pausando ejecución...");
        
        // Intentar extraer segundos del mensaje "wait X seconds"
        const match = error.message.match(/wait (\d+) seconds/);
        let waitTime = 65000; // Default > 60s si nos banean levemente
        
        if (match && match[1]) {
          // Agregamos 5 segundos de cortesía al tiempo que pide la API
          waitTime = (parseInt(match[1], 10) + 5) * 1000;
        }
        
        const waitSeconds = Math.ceil(waitTime / 1000);
        console.warn(`Esperando ${waitSeconds} segundos antes de reintentar...`);
        
        // Actualizamos la barra de progreso para que el usuario sepa qué pasa
        onProgress(i + 1, totalItems, `${dbItem.name} (⛔ Rate Limit: Esperando ${waitSeconds}s...)`);
        
        await sleep(waitTime);
        
        // Decrementamos i para reintentar este mismo item en la siguiente vuelta del loop
        // Solo si no abortaron durante la espera
        if (!signal?.aborted) {
            i--; 
            continue;
        }
      }
      
      // Errores de items desconocidos (400) u otros 500s
      const isUnknown = error.message && error.message.includes('400');

      // Si es otro error, devolvemos item vacío para no detener el flujo completamente
      onItemLoaded({
        id: `err-${i}`,
        name: dbItem.name,
        priceAmount: 0,
        priceCurrency: filter.currency,
        listingCount: isUnknown ? -1 : 0, // -1 indica error de nombre
        dustValIlvl84: dbItem.dustValIlvl84,
        dustRatio84: 0,
        dustValIlvl84Q20: dbItem.dustValIlvl84Q20,
        dustRatio84Q20: 0,
      });
    }
  }
};