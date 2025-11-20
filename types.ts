export enum SaleType {
  INSTANT = 'instant', // Instant Buyout Only
  INSTANT_AND_PERSON = 'instant_person', // Instant Buyout and In Person
  PERSON = 'person', // In Person Trade Only
  ANY = 'any' // Any
}

export enum Currency {
  CHAOS = 'chaos',
  DIVINE = 'divine',
  ALCH = 'alch'
}

export interface DustItemData {
  name: string;
  baseType: string;
  dustValIlvl84: number;     // Valor para Item Level 84+
  dustValIlvl84Q20: number;  // Valor para Item Level 84+ con 20% Calidad
}

export interface TradeItem {
  id: string;
  name: string;
  priceAmount: number;
  priceCurrency: Currency;
  listingCount: number;
  
  // Nuevos campos de datos
  dustValIlvl84: number;
  dustRatio84: number;
  
  dustValIlvl84Q20: number;
  dustRatio84Q20: number;

  icon?: string;
}

export interface FilterState {
  league: string;
  currency: Currency;
  saleType: SaleType;
  minDust: number;
}

export interface SortState {
  field: keyof TradeItem;
  direction: 'asc' | 'desc';
}