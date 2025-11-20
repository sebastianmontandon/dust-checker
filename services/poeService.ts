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

export const fetchTradeData = async (filter: FilterState): Promise<TradeItem[]> => {
  const results: TradeItem[] = [];

  // FILTRO: Solo procesar items que den más de 100,000 de Dust
  const highValueItems = DUST_DATABASE.filter(item => item.dustValue > 100000);

  console.log(`Iniciando escaneo de mercado en ${filter.league} para ${highValueItems.length} items de alto valor (>100k dust)...`);

  for (let i = 0; i < highValueItems.length; i++) {
    const dbItem = highValueItems[i];
    
    try {
      // Delay de 2.5 segundos entre items para respetar el rate limit (mas seguro)
      await sleep(2500); 

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
        // Pequeña pausa entre search y fetch details del mismo item
        await sleep(800);
        
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
      // Evitar división por cero
      const dustRatio = formattedAvgPrice > 0 ? dbItem.dustValue / formattedAvgPrice : 0;

      results.push({
        id: `real-${i}`,
        name: dbItem.name,
        priceAmount: formattedAvgPrice,
        priceCurrency: filter.currency, 
        listingCount: count,
        dustValue: dbItem.dustValue,
        dustRatio: parseFloat(dustRatio.toFixed(2)),
        icon: icon
      });

    } catch (error: any) {
      console.error(`Error obteniendo datos REALES para ${dbItem.name}:`, error);
      
      // MANEJO INTELIGENTE DE RATE LIMIT (429)
      if (error.message && error.message.includes('429')) {
        console.warn("⚠️ RATE LIMIT ALCANZADO. Pausando ejecución para enfriar...");
        
        // Intentar extraer segundos del mensaje "wait X seconds"
        const match = error.message.match(/wait (\d+) seconds/);
        let waitTime = 10000; // Default 10s
        if (match && match[1]) {
          waitTime = (parseInt(match[1], 10) + 2) * 1000; // Esperar lo que pide + 2s seguridad
        }
        
        console.warn(`Esperando ${waitTime/1000} segundos antes de continuar...`);
        await sleep(waitTime);
        
        // Opcional: Podríamos decrementar i para reintentar el mismo item, 
        // pero en este flujo simple lo marcamos como error y seguimos.
      }

      // Fallback para mostrar error visualmente
      results.push({
        id: `err-${i}`,
        name: dbItem.name,
        priceAmount: 0,
        priceCurrency: filter.currency,
        listingCount: 0,
        dustValue: dbItem.dustValue,
        dustRatio: 0,
      });
    }
  }

  return results.sort((a, b) => b.dustRatio - a.dustRatio);
};