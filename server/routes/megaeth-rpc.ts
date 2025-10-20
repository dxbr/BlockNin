import type { RequestHandler } from "express";

const RPC_ENDPOINTS = [
  process.env.MONAD_RPC_URL,
  "https://testnet-rpc.monad.xyz",
  "https://monad-testnet.drpc.org",
  "https://rpc.ankr.com/monad_testnet",
].filter((url): url is string => typeof url === "string" && url.length > 0);

export const handleMegaEthRpc: RequestHandler = async (req, res) => {
  let lastError:
    | { status: number; body: string; endpoint: string }
    | { status: number; body: string; endpoint?: string }
    | null = null;

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const text = await upstream.text();
      if (upstream.ok) {
        res.status(upstream.status);
        res.setHeader(
          "content-type",
          upstream.headers.get("content-type") || "application/json",
        );
        res.send(text);
        return;
      }
      lastError = { status: upstream.status, body: text, endpoint };
    } catch (e: any) {
      lastError = {
        status: 502,
        body: e?.message || String(e),
        endpoint,
      };
    }
  }

  if (lastError) {
    res.status(lastError.status).json({
      error: "upstream_failed",
      endpoint: lastError.endpoint,
      message: lastError.body,
    });
    return;
  }

  res.status(502).json({
    error: "upstream_failed",
    message: "No RPC endpoints responded",
  });
};
