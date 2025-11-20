import { Currency, DustItemData, SaleType } from './types';

export const LEAGUES = [
  { id: 'Keepers', name: 'Keepers' },
  { id: 'Hardcore Keepers', name: 'Hardcore Keepers' },
  { id: 'Standard', name: 'Standard' }
];

export const CURRENCIES = [
  { id: Currency.CHAOS, name: 'Chaos Orb', icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png' },
  { id: Currency.DIVINE, name: 'Divine Orb', icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png' },
  { id: Currency.ALCH, name: 'Orb of Alchemy', icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToRare.png' }
];

export const SALE_TYPES = [
  { id: SaleType.INSTANT, name: 'Solo Compra Instantánea' },
  { id: SaleType.INSTANT_AND_PERSON, name: 'Instantánea y Presencial' },
  { id: SaleType.PERSON, name: 'Solo Presencial' },
  { id: SaleType.ANY, name: 'Cualquiera' }
];

// This simulates the data from the Google Drive file provided in the prompt
// These values are approximations of Dust yield for T0/T1/T2 uniques.
export const DUST_DATABASE: DustItemData[] = [
  { name: 'Mageblood', baseType: 'Heavy Belt', dustValue: 2500000 },
  { name: 'Headhunter', baseType: 'Leather Belt', dustValue: 1800000 },
  { name: 'Kalandra\'s Touch', baseType: 'Ring', dustValue: 950000 },
  { name: 'Tabula Rasa', baseType: 'Simple Robe', dustValue: 45000 },
  { name: 'Goldrim', baseType: 'Leather Cap', dustValue: 12500 },
  { name: 'Wanderlust', baseType: 'Wool Shoes', dustValue: 8500 },
  { name: 'Lifesprig', baseType: 'Driftwood Wand', dustValue: 6000 },
  { name: 'Redbeak', baseType: 'Rusted Sword', dustValue: 5500 },
  { name: 'The Screaming Eagle', baseType: 'Jade Hatchet', dustValue: 15000 },
  { name: 'Cospri\'s Malice', baseType: 'Jewelled Foil', dustValue: 120000 },
  { name: 'Shavronne\'s Wrappings', baseType: 'Occultist\'s Vestment', dustValue: 350000 },
  { name: 'Kaom\'s Heart', baseType: 'Glorious Plate', dustValue: 420000 },
  { name: 'Void Battery', baseType: 'Prophecy Wand', dustValue: 180000 },
  { name: 'Prism Guardian', baseType: 'Archon Kite Shield', dustValue: 85000 },
  { name: 'Aegis Aurora', baseType: 'Champion Kite Shield', dustValue: 210000 }
];