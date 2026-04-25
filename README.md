# ArbiLearn — Web3 Education Platform ⚡

![ArbiLearn Banner](https://raw.githubusercontent.com/ArbitrumFoundation/docs/HEAD/static/img/arbitrum-logo-dark.svg)

> **Arbitrum Builder Labs — LamprosDAO Submission**

ArbiLearn is a fully responsive, premium Web3 education platform designed conceptually precisely to teach new developers the fundamentals of Layer 2 scaling, blockchain principles, and core Web3 concepts through beautiful interactive experiences. It requires zero frameworks. Pure HTML, CSS, and Vanilla JavaScript using modern Web APIs.

## 🚀 Live Demo Pages

1. **[Home (index.html)](index.html)** — Why Ethereum needs Layer 2, explaining Optimistic Rollups.
2. **[Web3 Concepts (concepts.html)](concepts.html)** — Side-by-side breakdowns of Web2vsWeb3, Ethereum vs Bitcoin.
3. **[Live Prices (prices.html)](prices.html)** — Real-time fetching of asset prices via CoinGecko API with filters.
4. **[Block Simulator (simulator.html)](simulator.html)** — An interactive environment testing SHA-256 hashes, Nonces, and cascade consequences breaking immutability.

## 📸 Screenshots

### 1. The Landing Experience
*[screenshot: Insert Landing Page preview here showing fluid gradient layers]*

### 2. Block Mining Simulator
*[screenshot: Insert Simulator showing the red "Chain Broken!" immutability cascade]*

### 3. Data Dashboard
*[screenshot: Insert Prices page showing active skeleton loading logic during fetch]*

## 🛠️ Tech Stack & Implementation Highlights

- **HTML5 & CSS3** (No Tailwind, No Bootstrap, No Frameworks).
- **Glassmorphism CSS Engine** using root variables, robust grid rendering, backdrop filters, and dynamic text-gradient fallbacks.
- **Vanilla JavaScript ES6+** utilizing classes, async flow, module-mimicry, and direct DOM manipulation.
- **REST APIs**: `fetch` API implementations capturing live financial data via `api.coingecko.com`.
- **Web Crypto API (`SubtleCrypto`)**: Deep, low-level browser SHA-256 hashing execution powering the Simulator logic directly inside the local browser context without server compute overhead.

## 🏃 Using / Running Locally

Since this repo utilizes strictly native frontend tools, setup is incredibly straightforward:

1. Clone or download this repository.
2. Ensure all files (`.html`, `.css`, `.js`) remain in the same root folder.
3. **Method A):** Run via VS Code's `Live Server` extension by right clicking `index.html`. 
4. **Method B):** Directly open the `index.html` file in any modern browser (Chrome, Edge, Safari, Firefox). 
   - *Note: SubtleCrypto hashing operations run fastest in Chrome/Edge, and JS fetch queries may occasionally block on raw file protocols (`file:///`) across strict CORS setups depending on specific browser versioning.*

## 💡 Known Improvements / Next Steps

- Integrate `localStorage` to cache initial user theme preference and fetch payloads.
- Improve the Simulator mining loop by abstracting computation directly into a native Web Worker off the main execution thread to avoid micro-blocking CSS animations.

---
**Built to Win 🥇** 
*Designed and Engineered for Arbitrum / LamprosDAO Cohort by Preyanshi.*