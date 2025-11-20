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

// Simulated database reflecting the Google Drive file structure.
// Expanded to include many high-value items.
export const DUST_DATABASE: DustItemData[] = [
  // --- Tier 0 Uniques (Massive Dust) ---
  { name: 'Mageblood', baseType: 'Heavy Belt', dustValIlvl84: 2500000, dustValIlvl84Q20: 3250000 },
  { name: 'Headhunter', baseType: 'Leather Belt', dustValIlvl84: 1800000, dustValIlvl84Q20: 2340000 },
  { name: 'The Squire', baseType: 'Elegant Round Shield', dustValIlvl84: 1500000, dustValIlvl84Q20: 1950000 },
  { name: 'Kalandra\'s Touch', baseType: 'Ring', dustValIlvl84: 950000, dustValIlvl84Q20: 1235000 },
  { name: 'Original Sin', baseType: 'Amethyst Ring', dustValIlvl84: 2800000, dustValIlvl84Q20: 2800000 }, // Rings usually don't have quality unless catalyzed
  
  // --- High Tier Armor/Weapons ---
  { name: 'Kaom\'s Heart', baseType: 'Glorious Plate', dustValIlvl84: 420000, dustValIlvl84Q20: 546000 },
  { name: 'Shavronne\'s Wrappings', baseType: 'Occultist\'s Vestment', dustValIlvl84: 350000, dustValIlvl84Q20: 455000 },
  { name: 'The Brass Dome', baseType: 'Gladiator Plate', dustValIlvl84: 320000, dustValIlvl84Q20: 416000 },
  { name: 'Lightning Coil', baseType: 'Desert Brigandine', dustValIlvl84: 280000, dustValIlvl84Q20: 364000 },
  { name: 'Cloak of Defiance', baseType: 'Lacquered Garb', dustValIlvl84: 250000, dustValIlvl84Q20: 325000 },
  { name: 'Voll\'s Protector', baseType: 'Holy Chainmail', dustValIlvl84: 220000, dustValIlvl84Q20: 286000 },
  
  // --- Shields ---
  { name: 'Aegis Aurora', baseType: 'Champion Kite Shield', dustValIlvl84: 210000, dustValIlvl84Q20: 273000 },
  { name: 'Prism Guardian', baseType: 'Archon Kite Shield', dustValIlvl84: 180000, dustValIlvl84Q20: 234000 },
  { name: 'Rise of the Phoenix', baseType: 'Mosaic Kite Shield', dustValIlvl84: 150000, dustValIlvl84Q20: 195000 },
  { name: 'Rathpith Globe', baseType: 'Titanium Spirit Shield', dustValIlvl84: 165000, dustValIlvl84Q20: 214500 },
  
  // --- Weapons ---
  { name: 'Void Battery', baseType: 'Prophecy Wand', dustValIlvl84: 180000, dustValIlvl84Q20: 234000 },
  { name: 'Cospri\'s Malice', baseType: 'Jewelled Foil', dustValIlvl84: 120000, dustValIlvl84Q20: 156000 },
  { name: 'Mjölner', baseType: 'Gavel', dustValIlvl84: 140000, dustValIlvl84Q20: 182000 },
  { name: 'Starforge', baseType: 'Infernal Sword', dustValIlvl84: 300000, dustValIlvl84Q20: 390000 },
  { name: 'Atziri\'s Disfavour', baseType: 'Vaal Axe', dustValIlvl84: 290000, dustValIlvl84Q20: 377000 },
  { name: 'Windripper', baseType: 'Imperial Bow', dustValIlvl84: 130000, dustValIlvl84Q20: 169000 },
  { name: 'Lioneye\'s Glare', baseType: 'Imperial Bow', dustValIlvl84: 110000, dustValIlvl84Q20: 143000 },
  
  // --- Helmets ---
  { name: 'Crown of the Inward Eye', baseType: 'Prophet Crown', dustValIlvl84: 125000, dustValIlvl84Q20: 162500 },
  { name: 'Devoto\'s Devotion', baseType: 'Nightmare Bascinet', dustValIlvl84: 95000, dustValIlvl84Q20: 123500 },
  { name: 'Alpha\'s Howl', baseType: 'Sinner Tricorne', dustValIlvl84: 85000, dustValIlvl84Q20: 110500 },
  { name: 'Abyssus', baseType: 'Ezomyte Burgonet', dustValIlvl84: 105000, dustValIlvl84Q20: 136500 },
  
  // --- Gloves ---
  { name: 'Thunderfist', baseType: 'Murder Mitts', dustValIlvl84: 90000, dustValIlvl84Q20: 117000 },
  { name: 'Voidbringer', baseType: 'Conjurer Gloves', dustValIlvl84: 75000, dustValIlvl84Q20: 97500 },
  { name: 'Hands of the High Templar', baseType: 'Crusader Gloves', dustValIlvl84: 150000, dustValIlvl84Q20: 195000 },

  // --- Boots ---
  { name: 'Skyforth', baseType: 'Sorcerer Boots', dustValIlvl84: 220000, dustValIlvl84Q20: 286000 },
  { name: 'Goldwyrm', baseType: 'Nubuck Boots', dustValIlvl84: 80000, dustValIlvl84Q20: 104000 },
  { name: 'Ralakesh\'s Impatience', baseType: 'Riveted Boots', dustValIlvl84: 310000, dustValIlvl84Q20: 403000 },
  
  // --- Classic Uniques (often used for dust) ---
  { name: 'Tabula Rasa', baseType: 'Simple Robe', dustValIlvl84: 45000, dustValIlvl84Q20: 45000 }, // Cannot quality
  { name: 'Goldrim', baseType: 'Leather Cap', dustValIlvl84: 12500, dustValIlvl84Q20: 16250 },
  { name: 'Wanderlust', baseType: 'Wool Shoes', dustValIlvl84: 8500, dustValIlvl84Q20: 11050 },
  { name: 'Lifesprig', baseType: 'Driftwood Wand', dustValIlvl84: 6000, dustValIlvl84Q20: 7800 },
  { name: 'Redbeak', baseType: 'Rusted Sword', dustValIlvl84: 5500, dustValIlvl84Q20: 7150 },
  { name: 'The Screaming Eagle', baseType: 'Jade Hatchet', dustValIlvl84: 15000, dustValIlvl84Q20: 19500 },
  
  // --- Meme / Specific Tech Items ---
  { name: 'The Oppressor', baseType: 'Elegant Round Shield', dustValIlvl84: 600000, dustValIlvl84Q20: 780000 }, // High tier base
  { name: 'Mjölner', baseType: 'Gavel', dustValIlvl84: 155000, dustValIlvl84Q20: 201500 },
  { name: 'Indigon', baseType: 'Hubris Circlet', dustValIlvl84: 210000, dustValIlvl84Q20: 273000 },
  { name: 'Badge of the Brotherhood', baseType: 'Turquoise Amulet', dustValIlvl84: 450000, dustValIlvl84Q20: 540000 }, // Amulets 20% with catalyst logic simplified

  // --- More fillers to reach ~50 items ---
  { name: 'Atziri\'s Reflection', baseType: 'Golden Buckler', dustValIlvl84: 500000, dustValIlvl84Q20: 650000 },
  { name: 'Soul Taker', baseType: 'Siege Axe', dustValIlvl84: 190000, dustValIlvl84Q20: 247000 },
  { name: 'Varunastra', baseType: 'Vaal Blade', dustValIlvl84: 115000, dustValIlvl84Q20: 149500 },
  { name: 'Singularity', baseType: 'Platinum Sceptre', dustValIlvl84: 65000, dustValIlvl84Q20: 84500 },
  { name: 'Divinarius', baseType: 'Imperial Skean', dustValIlvl84: 70000, dustValIlvl84Q20: 91000 },
  { name: 'Bino\'s Kitchen Knife', baseType: 'Slaughter Knife', dustValIlvl84: 85000, dustValIlvl84Q20: 110500 },
  { name: 'Vulconus', baseType: 'Demon Dagger', dustValIlvl84: 95000, dustValIlvl84Q20: 123500 },
  { name: 'Pledge of Hands', baseType: 'Judgement Staff', dustValIlvl84: 160000, dustValIlvl84Q20: 208000 },
  { name: 'Sire of Shards', baseType: 'Serpentine Staff', dustValIlvl84: 110000, dustValIlvl84Q20: 143000 },
  { name: 'Hegemony\'s Era', baseType: 'Judgement Staff', dustValIlvl84: 175000, dustValIlvl84Q20: 227500 },
  { name: 'Marohi Erqi', baseType: 'Karui Maul', dustValIlvl84: 140000, dustValIlvl84Q20: 182000 },
  { name: 'Kongor\'s Undying Rage', baseType: 'Terror Maul', dustValIlvl84: 135000, dustValIlvl84Q20: 175500 }
];