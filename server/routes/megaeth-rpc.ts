import type { RequestHandler } from "express";

const MEGAETH_RPC = "https://carrot.megaeth.com/rpc";

export const handleMegaEthRpc: RequestHandler = async (req, res) => {
  try {
    const upstream = await fetch(MEGAETH_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader(
      "content-type",
      upstream.headers.get("content-type") || "application/json",
    );
    res.send(text);
  } catch (e: any) {
    res
      .status(502)
      .json({ error: "upstream_failed", message: e?.message || String(e) });
  }
};
