import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";

export const BASE = {
  chainId: 8453,
  chainIdHex: "0x2105",
  name: "Base",
  rpcUrl: "https://mainnet.base.org",
  currency: { name: "Ether", symbol: "ETH", decimals: 18 },
  explorer: "https://base.blockscout.com/",
} as const;

export const LEADERBOARD_ADDRESS =
  "0x7B21Ae885942643CAb67E87AA0C427c12B40946D" as const;

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

export async function ensureBaseChain(provider: any) {
  const chainIdHex = BASE.chainIdHex;
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
            chainName: BASE.name,
            nativeCurrency: BASE.currency,
            rpcUrls: [BASE.rpcUrl],
            blockExplorerUrls: [BASE.explorer],
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
  await ensureBaseChain(injected);
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
  return new JsonRpcProvider(`${origin}/api/base-rpc`);
}

export function getContract<T extends any>(signerOrProvider: any) {
  return new Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, signerOrProvider);
}
