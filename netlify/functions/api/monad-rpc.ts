export async function handler(event: any) {
  try {
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing JSON-RPC request body" }),
      };
    }

    const res = await fetch("https://rpc.ankr.com/monad_testnet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    // Return upstream status and body as-is
    return {
      statusCode: res.status,
      body: text,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    };
  } catch (err: any) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Failed to connect to Monad RPC",
        details: err?.message || String(err),
      }),
    };
  }
}
