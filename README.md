# Exile Dust Calculator

A specialized tool for Path of Exile designed to calculate the cost-efficiency of disenchanting items into **Thaumaturgic Dust** (Settlers of Kalguur / Keepers mechanics).

## ⭐ Community Project
This tool was created with the sole purpose of helping the PoE community. It is completely **non-profit**.

If you find it useful, consider supporting the project by giving a **Star ⭐** to the repository or proposing improvements!
[**View Repository**](https://github.com/sebastianmontandon/dust-checker)

---

## 🚀 Features

- **Real-Time Market Scan**: Connects directly to the official Path of Exile Trade API to fetch current item prices.
- **Smart Rate Limiting**: Implements a robust queue system with delays, pauses, and exponential backoff to respect GGG's strict API rate limits and prevent IP bans.
- **Dust Efficiency Ratio**: Automatically calculates the *Dust per Chaos* ratio for both base items and items with 20% quality.
- **Auto Currency Exchange**: Fetches the real-time Divine Orb to Chaos Orb exchange rate using a bidirectional (Buy/Sell) averaging strategy for maximum accuracy.
- **Live Currency Normalization**: Automatically converts mixed prices (Divine/Chaos) into a unified value for easy comparison.
- **Pausable Scans**: Ability to pause and resume scans without losing progress.

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript)
- **Styling**: Tailwind CSS (Custom PoE Theme)
- **API**: Path of Exile Official Trade API (via CORS Proxy)
- **Bundler**: Vite

## ⚙️ How it Works

1.  **Item Database**: The app contains a curated database of Unique items known for high Dust values (e.g., T0/T1 uniques).
2.  **Exchange Rate**: On start, it queries the `exchange` endpoint to find the current market value of Divine Orbs.
3.  **Scanning**: It iterates through the item list, querying the `search` endpoint.
4.  **Rate Limit Handling**:
    - Base delay between requests.
    - "Batch Cooling" pauses every few items.
    - Dynamic detection of `429 Too Many Requests` headers to automatically pause and retry after the timeout specified by the API.
5.  **Normalization**: Prices are fetched, converted to Chaos Orbs if necessary, averaged (Top 10 listings), and then compared against the item's Dust value.

## ⚠️ Disclaimer

This tool is not affiliated with Grinding Gear Games. Path of Exile is a registered trademark of Grinding Gear Games.