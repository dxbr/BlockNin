import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";

export const MEGAETH = {
  chainId: 6342,
  chainIdHex: "0x18C6",
  name: "MegaETH Testnet",
  rpcUrl: "https://carrot.megaeth.com/rpc",
  fallbackRpcUrls: ["https://6342.rpc.thirdweb.com"],
  currency: { name: "MegaETH", symbol: "MEGA", decimals: 18 },
  explorer: "https://www.megaexplorer.xyz/",
} as const;

export const LEADERBOARD_ADDRESS =
  "0x1C38845ee1240D83B2bec9D5655aaB543fa74b77" as const;

export const LEADERBOARD_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
    ],
    name: "NewHighScore",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ScoreSubmitted",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
    name: "submitScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getGlobalHighScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerBestScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerScores",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint256", name: "score", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct Leaderboard.ScoreEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerTotalGames",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "limit", type: "uint256" }],
    name: "getTopScores",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint256", name: "score", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct Leaderboard.ScoreEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalScores",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "playerBestScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "playerTotalGames",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "scores",
    outputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint256", name: "score", type: "uint256" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const MEGAETH_RPC_URLS = Array.from(
  new Set([MEGAETH.rpcUrl, ...(MEGAETH.fallbackRpcUrls ?? [])]),
);

const WALLET_CACHE_KEY = "__block_ninja_wallet";

export function setCachedWalletAddress(address: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (address) {
      window.localStorage.setItem(WALLET_CACHE_KEY, address);
    } else {
      window.localStorage.removeItem(WALLET_CACHE_KEY);
    }
  } catch (_err) {
    // ignore storage errors (private browsing, etc.)
  }
}

export function getCachedWalletAddress(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(WALLET_CACHE_KEY);
  } catch (_err) {
    return null;
  }
}

export async function restoreWalletConnection(): Promise<{
  address: string;
  provider: BrowserProvider;
} | null> {
  const injected = detectInjectedProvider();
  if (!injected) return null;
  let accounts: string[] = [];
  try {
    accounts = await injected.request({ method: "eth_accounts" });
  } catch (_err) {
    return null;
  }
  const address = accounts?.[0];
  if (!address) {
    setCachedWalletAddress(null);
    return null;
  }
  try {
    const chainId: string = await injected.request({ method: "eth_chainId" });
    if ((chainId ?? "").toLowerCase() !== MEGAETH.chainIdHex.toLowerCase()) {
      await ensureMegaETHChain(injected);
    }
  } catch (_err) {
    // ignore chain sync issues during passive restore
  }
  const provider = new BrowserProvider(injected);
  setCachedWalletAddress(address);
  return { address, provider };
}

export type InjectedEthereum = (Window & typeof globalThis) & {
  ethereum?: any;
  okxwallet?: any;
};

export function detectInjectedProvider(): any | null {
  const w = window as InjectedEthereum;
  const { ethereum } = w;
  if (!ethereum) return w.okxwallet ?? null;
  const providers: any[] | undefined = (ethereum as any).providers;
  if (providers?.length) {
    const okx = providers.find((p) => p.isOkxWallet);
    if (okx) return okx;
    const mm = providers.find((p) => p.isMetaMask);
    if (mm) return mm;
    return providers[0];
  }
  if ((ethereum as any).isOkxWallet) return ethereum;
  if ((ethereum as any).isMetaMask) return ethereum;
  return ethereum;
}

export async function ensureMegaETHChain(provider: any) {
  const chainIdHex = MEGAETH.chainIdHex;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (err: any) {
    if (
      err?.code === 4902 ||
      ("message" in err && String(err.message).includes("Unrecognized chain"))
    ) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: MEGAETH.name,
            nativeCurrency: MEGAETH.currency,
            rpcUrls: [MEGAETH.rpcUrl],
            blockExplorerUrls: [MEGAETH.explorer],
          },
        ],
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } else {
      throw err;
    }
  }
}

export async function connectWallet(): Promise<{
  address: string;
  provider: BrowserProvider;
}> {
  console.log("[wallet] connect init");
  const injected = detectInjectedProvider();
  if (!injected) throw new Error("No injected wallet found");
  await ensureMegaETHChain(injected);
  const browserProvider = new BrowserProvider(injected);
  const accounts: string[] = await injected.request({
    method: "eth_requestAccounts",
  });
  const address = accounts[0];
  console.log("[wallet] connected", address);
  return { address, provider: browserProvider };
}

export function getReadProvider() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return new JsonRpcProvider(`${origin}/api/megaeth-rpc`);
}

export function getContract<T extends any>(signerOrProvider: any) {
  return new Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, signerOrProvider);
}
