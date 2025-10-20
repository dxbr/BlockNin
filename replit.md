# Block Ninja - Replit Setup

## Project Overview
Block Ninja is a blockchain-based arcade slicing game built with React, TypeScript, and Vite. Players connect their Monad-compatible wallet to slice falling blocks, build combos, and submit scores to an on-chain leaderboard.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express server (integrated with Vite dev server)
- **Blockchain**: Monad Testnet (ethers.js v6)
- **UI**: Tailwind CSS + Radix UI components
- **Package Manager**: npm (originally pnpm)

## Project Structure
- `client/` - React frontend application
  - `components/` - UI components (game logic, Radix UI)
  - `pages/` - Route pages (Index, Leaderboard, NotFound)
  - `lib/` - Blockchain integration, utilities
- `server/` - Express backend
  - `routes/` - API routes (RPC proxy, demo endpoints)
  - `index.ts` - Server creation
  - `node-build.ts` - Production server entry point
- `shared/` - Shared types and utilities
- `contracts/` - Smart contract ABIs
- `public/` - Static assets

## Development Setup
- **Port**: 5000 (configured for Replit proxy)
- **Dev Command**: `npm run dev`
- **Workflow**: Single workflow running Vite dev server with Express middleware

## Key Features
1. **Wallet Gate**: Requires Monad-compatible wallet connection before gameplay
2. **Canvas Gameplay**: Custom WebGL/canvas rendering with physics
3. **RPC Proxy**: Express server proxies blockchain RPC calls to avoid CORS issues
4. **On-chain Leaderboard**: Smart contract at `0xa5D9C5547ea882f0047Fdc3669c6857590e8Fef8`
5. **Routing**: React Router for game and leaderboard pages

## Blockchain Integration
- **Network**: Monad Testnet
- **Chain ID**: 10143 (0x279F)
- **RPC URL**: https://rpc.ankr.com/monad_testnet (via Ankr)
- **Explorer**: https://testnet.monadexplorer.com/
- **Contract**: Leaderboard.sol - tracks player scores and global high scores

## Environment Configuration
- Development runs on port 5000 with HMR enabled
- Production uses built files served by Express from `dist/spa`
- RPC proxy endpoint: `/api/megaeth-rpc`

## Deployment
- **Type**: Autoscale (stateless web app)
- **Build**: `npm run build` (builds client and server)
- **Run**: `npm start` (runs production server)

## Recent Changes (October 20, 2025)
- Updated Vite config to use port 5000 (Replit requirement)
- Added `allowedHosts: true` to Vite config (critical for Replit proxy)
- Configured HMR for Replit proxy environment
- Set up workflow for development server
- Configured autoscale deployment
- Changed default port in production server to 5000
- Updated RPC endpoint to official Monad testnet RPC: `https://testnet-rpc.monad.xyz`
- Added fallback RPC endpoints (dRPC and Ankr) for improved reliability
- Installed all npm dependencies
- Verified leaderboard functionality with blockchain integration

## Notes
- The project originally used pnpm but works with npm in Replit
- HMR WebSocket warnings in browser console are cosmetic (Replit proxy limitation)
- The game requires a Monad-compatible wallet (MetaMask, OKX) to play
