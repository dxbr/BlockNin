# Block Ninja

Block Ninja is a fast-paced slicing game where players cut cascading blocks, chase high scores, and compete on an on-chain leaderboard. The experience blends arcade gameplay with a wallet-gated flow, sound design, and a responsive interface built with modern web tooling.

---

## Features

- Precision canvas gameplay with tuned physics, miss detection, slow-motion meter, and responsive pointer support.
- Wallet-gated sessions that blur the background until a Monad-compatible wallet connects, preventing unintended interactions.
- On-chain leaderboard backed by a Monad Testnet smart contract that aggregates every submitted score per player.
- Audio feedback using Builder-hosted `Ninja.mp3` and `MouseClick.wav` clips to punctuate block hits and UI interactions.
- Polished UI overlays for start, pause, scoreboard, and submission flows, with menus fully blocking gameplay when active.
- Express proxy that relays RPC calls to the Monad Testnet, avoiding browser CORS issues.

---

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Radix UI primitives.
- Rendering: Custom canvas/WebGL loop orchestrated inside `BlockNinja.tsx`.
- Blockchain: `ethers` v6 with a Monad Testnet contract (`Leaderboard.sol`).
- Backend: Express server co-located with the Vite build for proxying blockchain requests.
- Tooling: pnpm, Vitest, TypeScript strict mode, PostCSS, Tailwind Merge.

---

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (preferred package manager for this template)

### Install dependencies

```bash
pnpm install
```
### Run the development server
```bash
pnpm dev
```
This starts Vite (client) and the Express server on a single port with hot reload.

### Run tests and quality checks
```bash
pnpm test        # Vitest test suite
pnpm typecheck   # TypeScript diagnostics
pnpm build       # Production client + server bundles
```
Gameplay Overview

Players connect an injected Monad-compatible wallet (MetaMask, OKX, etc.).

The gate overlay disappears, revealing the Block Ninja canvas and HUD.

Slice falling blocks to increase the score and build combos; missing a peaked block ends the run.

Submit the final score to the Leaderboard contract. A confirmation dialog protects against accidental submissions.

Visit the /leaderboard route to view aggregated standings with real-time refresh.

Smart Contract & Blockchain Integration

```
Network: Monad Testnet

RPC URL: https://testnet-rpc.monad.xyz/

Chain ID: 10143

Currency Symbol: MON

Block Explorer: https://testnet.monadexplorer.com/
```
```
Contract Address: 0xa5D9C5547ea882f0047Fdc3669c6857590e8Fef8
ABI: Provided in the project contracts/LeaderboardABI.json
```
The client uses connectWallet() to ensure the Monad Testnet chain is added and selected before play via ensureMonadChain().

getReadProvider() talks to /api/monad-rpc, which rotates through the configured Monad RPC endpoints (override with MONAD_RPC_URL) and falls back to a secondary provider if the primary endpoint rejects the call.

Scores are summed across multiple submissions per address before rendering in the leaderboard page.

## License

This project is licensed under the **MIT License**.  
You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, under the conditions described in the [LICENSE](LICENSE) file.

