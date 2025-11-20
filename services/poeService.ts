import { Currency, FilterState, SaleType, TradeItem } from '../types';
import { DUST_DATABASE } from '../constants';

const POE_TRADE_API = 'https://www.pathofexile.com/api/trade';

// PROXY: Necesario para evitar el bloqueo CORS en navegadores (Client-side only)
const CORS_PROXY = 'https://corsproxy.io/?';

// Headers requeridos
const HEADERS = {
  'Content-Type': 'application/json',
};

// Función auxiliar para pausar la ejecución (evitar rate limits)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mapea el tipo de venta seleccionado a los filtros de la API de PoE
 */
const getStatusOption = (saleType: SaleType): string => {
  switch (saleType) {
    case SaleType.INSTANT: return 'securable'; 
    case SaleType.INSTANT_AND_PERSON: return 'available'; 
    case SaleType.PERSON: return 'online'; 
    case SaleType.ANY: return 'any'; 
    default: return 'online';
  }
};

const getProxiedUrl = (targetUrl: string): string => {
  return `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
};

/**
 * Obtiene el ratio Divine/Chaos realizando dos búsquedas (Bid/Ask) y promediando.
 */
const getDivineChaosRatio = async (league: string): Promise<number> => {
  try {
    const exchangeUrl = getProxiedUrl(`${POE_TRADE_API}/exchange/${league}`);

    // PAYLOAD 1: HAVE DIVINES AND I WANT CHAOS (Sellers of Divine)
    const payloadHaveDiv = {
      query: {
        status: { option: "securable" },
        have: ["divine"],
        want: ["chaos"]
      },
      sort: { have: "asc" }
    };

    // PAYLOAD 2: HAVE CHAOS AND I WANT DIVINES (Buyers of Divine)
    const payloadHaveChaos = {
      query: {
        status: { option: "securable" },
        have: ["chaos"],
        want: ["divine"]
      },
      sort: { have: "asc" }
    };

    // Ejecutar ambas búsquedas en paralelo
    const [resHaveDiv, resHaveChaos] = await Promise.all([
      fetch(exchangeUrl, { method: 'POST', headers: HEADERS, body: JSON.stringify(payloadHaveDiv) }),
      fetch(exchangeUrl, { method: 'POST', headers: HEADERS, body: JSON.stringify(payloadHaveChaos) })
    ]);

    let ratioHaveDiv = 0;
    let ratioHaveChaos = 0;

    // Procesar HAVE DIVINE (Venta de Divines)
    if (resHaveDiv.ok) {
      const data = await resHaveDiv.json();
      const ids = Object.keys(data.result || {}).slice(0, 5);
      if (ids.length > 0) {
        const details = await fetchExchangeDetails(ids, data.id); // data.id is queryId
        // Calcular cuantos Chaos dan por 1 Divine
        // Estructura offers: item (lo que tiene el vendedor: divine), exchange (lo que quiere: chaos)
        // Ratio = exchange amount / item amount
        let sum = 0;
        let count = 0;
        details.forEach((d: any) => {
            const offer = d.listing?.offers?.[0];
            if (offer) {
                const divAmount = offer.item.amount;
                const chaosAmount = offer.exchange.amount;
                if (divAmount > 0) {
                    sum += (chaosAmount / divAmount);
                    count++;
                }
            }
        });
        if (count > 0) ratioHaveDiv = sum / count;
      }
    }

    // Procesar HAVE CHAOS (Compra de Divines con Chaos)
    if (resHaveChaos.ok) {
      const data = await resHaveChaos.json();
      const ids = Object.keys(data.result || {}).slice(0, 5);
      if (ids.length > 0) {
        const details = await fetchExchangeDetails(ids, data.id);
        // Calcular cuantos Chaos cuesta 1 Divine
        // Estructura offers: item (lo que tiene el vendedor: chaos), exchange (lo que quiere: divine)
        // Ratio = item amount / exchange amount
        let sum = 0;
        let count = 0;
        details.forEach((d: any) => {
            const offer = d.listing?.offers?.[0];
            if (offer) {
                const chaosAmount = offer.item.amount;
                const divAmount = offer.exchange.amount;
                if (divAmount > 0) {
                    sum += (chaosAmount / divAmount);
                    count++;
                }
            }
        });
        if (count > 0) ratioHaveChaos = sum / count;
      }
    }

    console.log(`Ratios calculados - Venta (Div->Chaos): ${ratioHaveDiv}, Compra (Chaos->Div): ${ratioHaveChaos}`);

    // Promediar los dos lados
    if (ratioHaveDiv > 0 && ratioHaveChaos > 0) {
        return Math.round((ratioHaveDiv + ratioHaveChaos) / 2);
    } else if (ratioHaveDiv > 0) {
        return Math.round(ratioHaveDiv);
    } else if (ratioHaveChaos > 0) {
        return Math.round(ratioHaveChaos);
    }

    return 150; // Fallback seguro

  } catch (e) {
    console.warn("Error calculando Divine Ratio, usando fallback 150", e);
    return 150;
  }
};

/**
 * Fetch específico para detalles de Exchange (estructura distinta a Trade Search)
 */
const fetchExchangeDetails = async (ids: string[], queryId: string): Promise<any[]> => {
    // Para exchange, la URL suele requerir el parámetro exchange en el fetch o usa endpoint distinto.
    // Sin embargo, la documentación indica usar /api/trade/fetch con ids.
    // La diferencia clave es que los IDs de exchange son complejos.
    const idsStr = ids.join(',');
    const targetUrl = `${POE_TRADE_API}/fetch/${idsStr}?query=${queryId}&exchange=true`; 
    const url = getProxiedUrl(targetUrl);
    
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) return [];
    
    const json = await response.json();
    return json.result || [];
};


/**
 * Realiza la búsqueda de un item específico
 */
const searchItem = async (league: string, name: string, type: string, saleType: SaleType, currency: Currency) => {
  const targetUrl = `${POE_TRADE_API}/search/${league}`;
  const url = getProxiedUrl(targetUrl);
  
  const query: any = {
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
    ]
  };

  // Si es "Equivalentes a Chaos", NO enviamos filtro de precio.
  // Si es "Chaos & Divines" (CHAOS_DIVINE), usamos 'chaos_divine' option si la API lo soporta, 
  // pero la API pública prefiere que no mandemos filtro de precio y filtremos después, 
  // O mandemos filtro de precio en chaos si queremos normalizar.
  // Para este caso, pedimos cualquiera (sin filtro de currency) para obtener resultados mixtos
  if (currency !== Currency.CHAOS_EQUIVALENT && currency !== Currency.CHAOS_DIVINE) {
    query.filters = {
      trade_filters: {
        filters: {
          price: {
            option: currency 
          }
        }
      }
    };
  }

  const body = {
    query: query,
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

const fetchItemDetails = async (ids: string[], queryId: string): Promise<any> => {
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
  onProgress: (current: number, total: number, itemName: string, ratio?: number) => void,
  checkPaused: () => Promise<void>,
  signal?: AbortSignal,
  manualRatioOverride?: number
): Promise<void> => {
  
  // 1. Obtener el ratio real antes de empezar, o usar el manual si existe
  let divineRatio = 150;
  
  if (manualRatioOverride && manualRatioOverride > 0) {
    divineRatio = manualRatioOverride;
    console.log(`Usando Ratio Manual: ${divineRatio}`);
  } else {
    try {
      divineRatio = await getDivineChaosRatio(filter.league);
    } catch (e) {
      console.error("Falló el cálculo inicial de ratio", e);
    }
  }

  // Escanear solo items con dust base > 100,000
  const itemsToScan = DUST_DATABASE.filter(item => item.dustValIlvl84 > 100000);
  const totalItems = itemsToScan.length;

  console.log(`Iniciando escaneo. Ratio Final: ${divineRatio}c`);

  for (let i = 0; i < itemsToScan.length; i++) {
    if (signal?.aborted) break;
    await checkPaused();

    const dbItem = itemsToScan[i];
    onProgress(i + 1, totalItems, dbItem.name, divineRatio);

    try {
      // Jitter & Delay
      const randomJitter = Math.floor(Math.random() * 2000);
      await sleep(6000 + randomJitter); 

      if (signal?.aborted) break;
      await checkPaused();

      // Batch Cooling
      if (i > 0 && i % 5 === 0) {
         onProgress(i + 1, totalItems, `${dbItem.name} (Cooling API 15s...)`, divineRatio);
         await sleep(15000);
      }

      if (signal?.aborted) break;
      await checkPaused();

      const searchResult = await searchItem(
        filter.league, 
        dbItem.name, 
        dbItem.baseType, 
        filter.saleType,
        filter.currency
      );

      let avgPriceChaos = 0;
      let count = 0;
      let icon = undefined;
      let validListingsCount = 0;

      if (searchResult.result && searchResult.result.length > 0) {
        await sleep(2000);
        if (signal?.aborted) break;
        await checkPaused();
        
        const detailsData = await fetchItemDetails(searchResult.result, searchResult.id);
        const listings = detailsData.result;
        
        if (listings && listings.length > 0) {
          // Calcular precio promedio normalizado a Chaos
          let totalChaos = 0;
          
          listings.forEach((item: any) => {
             const amount = item.listing?.price?.amount || 0;
             const curr = item.listing?.price?.currency || 'chaos';
             
             if (curr === 'divine') {
               totalChaos += amount * divineRatio;
               validListingsCount++;
             } else if (curr === 'chaos') {
               totalChaos += amount;
               validListingsCount++;
             } else {
               // Ignorar otras monedas (Mirrors, Alchs, Exalts) para no romper el promedio
               console.warn(`Ignorando moneda no estándar para ${dbItem.name}: ${amount} ${curr}`);
             }
          });
          
          if (validListingsCount > 0) {
            avgPriceChaos = totalChaos / validListingsCount;
          }
          count = searchResult.total;
          icon = listings[0].item.icon;
        }
      }

      // Lógica de Visualización:
      // Si el precio en chaos > ratio, mostramos en Divines
      let displayAmount = avgPriceChaos;
      let displayCurrency = Currency.CHAOS;
      
      if (avgPriceChaos > divineRatio) {
        displayAmount = parseFloat((avgPriceChaos / divineRatio).toFixed(1));
        displayCurrency = Currency.DIVINE;
      } else {
        displayAmount = parseFloat(avgPriceChaos.toFixed(1));
      }

      const dustRatio84 = avgPriceChaos > 0 ? dbItem.dustValIlvl84 / avgPriceChaos : 0;
      const dustRatio84Q20 = avgPriceChaos > 0 ? dbItem.dustValIlvl84Q20 / avgPriceChaos : 0;

      // Build Trade URL
      const tradeUrl = searchResult.id 
        ? `https://www.pathofexile.com/trade/search/${filter.league}/${searchResult.id}`
        : undefined;

      onItemLoaded({
        id: `real-${i}`,
        name: dbItem.name,
        priceAmount: displayAmount,
        priceCurrency: displayCurrency,
        listingCount: count,
        
        dustValIlvl84: dbItem.dustValIlvl84,
        dustRatio84: parseFloat(dustRatio84.toFixed(0)),
        
        dustValIlvl84Q20: dbItem.dustValIlvl84Q20,
        dustRatio84Q20: parseFloat(dustRatio84Q20.toFixed(0)),

        icon: icon,
        tradeUrl: tradeUrl
      });

    } catch (error: any) {
      if (signal?.aborted) break;
      console.error(`Error: ${dbItem.name}`, error);
      
      if (error.message && error.message.includes('429')) {
        const match = error.message.match(/wait (\d+) seconds/);
        let waitTime = 65000; 
        if (match && match[1]) waitTime = (parseInt(match[1], 10) + 5) * 1000;
        const waitSeconds = Math.ceil(waitTime / 1000);
        
        onProgress(i + 1, totalItems, `${dbItem.name} (⛔ Rate Limit: Waiting ${waitSeconds}s...)`, divineRatio);
        await sleep(waitTime);
        if (!signal?.aborted) { i--; continue; }
      }
      
      onItemLoaded({
        id: `err-${i}`,
        name: dbItem.name,
        priceAmount: 0,
        priceCurrency: filter.currency,
        listingCount: 0, 
        dustValIlvl84: dbItem.dustValIlvl84,
        dustRatio84: 0,
        dustValIlvl84Q20: dbItem.dustValIlvl84Q20,
        dustRatio84Q20: 0,
      });
    }
  }
};