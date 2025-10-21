import type { RequestHandler } from "express";

const RPC_ENDPOINTS = [
  process.env.MONAD_RPC_URL,
  "https://testnet-rpc.monad.xyz",
  "https://monad-testnet.drpc.org",
  "https://rpc.ankr.com/monad_testnet",
].filter((url): url is string => typeof url === "string" && url.length > 0);

export const handleMegaEthRpc: RequestHandler = async (req, res) => {
  // Ensure we have a request body to forward
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  if (!body) {
    return res.status(400).json({
      error: "bad_request",
      message: "Request body is required",
    });
  }

  let lastError:
    | { status: number; body: string; endpoint: string }
    | { status: number; body: string; endpoint?: string }
    | null = null;

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body,
      });
      const responseText = await upstream.text();

      // Forward the response as-is, regardless of HTTP status
      // RPC servers return 200 OK even for JSON-RPC errors
      res.status(upstream.status);
      res.setHeader(
        "content-type",
        upstream.headers.get("content-type") || "application/json",
      );
      res.send(responseText);
      return;
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
