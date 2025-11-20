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
  dustValue: number; // Base dust value from the "drive file"
}

export interface TradeItem {
  id: string;
  name: string;
  priceAmount: number;
  priceCurrency: Currency;
  listingCount: number;
  dustValue: number;
  dustRatio: number; // Dust per 1 unit of currency
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