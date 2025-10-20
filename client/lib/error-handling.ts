import { toast } from "sonner";

let initialized = false;

function normalizeMessage(err: any): string {
  const code = err?.code ?? err?.error?.code ?? err?.info?.error?.code;
  const msg = String(err?.message || err?.reason || err || "Unknown error");

  if (msg.includes("No injected wallet") || /No\s*wallet/i.test(msg)) {
    return "No wallet detected. Install MetaMask or OKX Wallet and try again.";
  }
  if (code === 4001 || /user rejected|denied transaction/i.test(msg)) {
    return "Request rejected in wallet.";
  }
  if (code === 4902 || /Unrecognized chain|wallet_addEthereumChain/i.test(msg)) {
    return "Network not found in wallet. Please approve adding Monad Testnet.";
  }
  if (/network|rpc|fetch|ECONN|Failed to fetch|timeout/i.test(msg)) {
    return "Network error. Check your connection or try again in a moment.";
  }
  if (/insufficient funds|gas/i.test(msg)) {
    return "Insufficient funds for gas. Get test MON and try again.";
  }
  return msg.replace(/^Error:\s*/i, "").trim();
}

export function toFriendlyError(err: any): string {
  try {
    return normalizeMessage(err);
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export function initGlobalErrorHandlers() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (e) => {
    const msg = toFriendlyError(e?.error || e?.message || e);
    toast.error("An error occurred", { description: msg });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason: any = (e as PromiseRejectionEvent).reason;
    const msg = toFriendlyError(reason);
    toast.error("Action failed", { description: msg });
  });
}
