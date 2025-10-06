# Block Ninja

Block Ninja is a fast-paced slicing game where players cut cascading blocks, chase high scores, and compete on an on-chain leaderboard. The experience blends arcade gameplay with a wallet-gated flow, sound design, and a responsive interface built with modern web tooling.

## Features

- **Precision canvas gameplay** with tuned physics, miss detection, slow-motion meter, and responsive pointer support.
- **Wallet-gated sessions** that blur the background until an Abstract-compatible wallet connects, preventing unintended interactions.
- **On-chain leaderboard** backed by an EVM smart contract that aggregates every submitted score per player.
- **Audio feedback** using Builder-hosted `Ninja.mp3` and `MouseClick.wav` clips to punctuate block hits and UI interactions.
- **Polished UI overlays** for start, pause, scoreboard, and submission flows, with menus fully blocking gameplay when active.
- **Express proxy** that relays RPC calls to the Abstract network, avoiding browser CORS issues.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Radix UI primitives.
- **Rendering:** Custom canvas/WebGL loop orchestrated inside `BlockNinja.tsx`.
- **Blockchain:** `ethers` v6 with an Abstract mainnet contract (`Leaderboard.sol`).
- **Backend:** Express server co-located with the Vite build for proxying blockchain requests.
- **Tooling:** pnpm, Vitest, TypeScript strict mode, PostCSS, Tailwind Merge.

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

## Gameplay Overview

1. Players connect an injected Abstract-compatible wallet (MetaMask, OKX, etc.).
2. The gate overlay disappears, revealing the Block Ninja canvas and HUD.
3. Slice falling blocks to increase the score and build combos; missing a peaked block ends the run.
4. Submit the final score to the `Leaderboard` contract. A confirmation dialog protects against accidental submissions.
5. Visit the `/leaderboard` route to view aggregated standings with real-time refresh.

## Smart Contract & Blockchain Integration

- Contract address: `0x8D31202eadF93139838b993a4BA557724Fb3D0c4` (Abstract mainnet).
- The client uses `connectWallet()` to ensure the Abstract chain is added and selected before play.
- `getReadProvider()` talks to `/api/abs-rpc`, which proxies JSON-RPC traffic to `https://api.mainnet.abs.xyz` via `server/routes/abs-rpc.ts`.
- Scores are summed across multiple submissions per address before rendering in the leaderboard page.

## Project Structure

```text
client/
  components/
    game/            Canvas engine, HUD, and styling
    ui/              Shared Radix-based UI components
  lib/               Blockchain utilities and helpers
  pages/             SPA routes (home, leaderboard, 404)
server/
  routes/            Express handlers, including Abstract RPC proxy
shared/              Types shared between client and server
contracts/           Solidity source for the leaderboard contract
netlify/functions/   Serverless adapter for deployment
```

## Recent Fixes & Improvements

- Corrected miss detection so only blocks that passed their apex trigger game over.
- Prevented gameplay input when menus or overlays are showing, eliminating background interactions.
- Summed leaderboard scores per wallet instead of showing only the single best run.
- Added wallet gate blur and UI hiding to keep onboarding focused.
- Wired hit and UI sounds with preload, volume tuning, and idempotent playback.
- Hardened score submission flow with confirmation prompts and toast feedback.

## Deployment

Deployments are compatible with Netlify or Vercel. To publish:

1. Build the project with `pnpm build` (optional but recommended before shipping).
2. Use the Builder.io MCP integrations for hosting:
   - [Connect to Netlify](#open-mcp-popover) for continuous deployment and serverless adapters.
   - [Connect to Vercel](#open-mcp-popover) for zero-config React hosting.
3. Provide environment variables/secrets through the hosting dashboard rather than committing them.

For previewing without full deployment, share the in-app [Open Preview](#open-preview) link with collaborators.

## Available MCP Integrations

Builder.io projects can connect to the following MCP servers through the platform UI:

- [Connect to Supabase](#open-mcp-popover) — database, auth, and real-time APIs.
- [Connect to Neon](#open-mcp-popover) — serverless Postgres.
- [Connect to Netlify](#open-mcp-popover) — deployment and CDN.
- [Connect to Zapier](#open-mcp-popover) — automation across thousands of apps.
- [Connect to Figma](#open-mcp-popover) — design-to-code workflows via the Builder plugin.
- [Connect to Builder.io](#open-mcp-popover) — manage CMS content and assets.
- [Connect to Linear](#open-mcp-popover) — project and issue tracking.
- [Connect to Notion](#open-mcp-popover) — documentation and notes.
- [Connect to Sentry](#open-mcp-popover) — error monitoring and performance telemetry.
- [Connect to Prisma](#open-mcp-popover) — ORM management for Postgres.
- [Connect to Context7](#open-mcp-popover) — up-to-date framework and library docs.

## Contributing

1. Create a new branch for your feature.
2. Run `pnpm typecheck` and `pnpm test` before opening a pull request.
3. Ensure UI additions follow the component patterns in `client/components/ui` and favor composable, accessible primitives.

## License

This project is currently unlicensed. Contact the maintainers if you intend to use or distribute the code.
