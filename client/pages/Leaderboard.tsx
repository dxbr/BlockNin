import { useEffect, useState } from "react";
import { getContract, getReadProvider, LEADERBOARD_ADDRESS } from "@/lib/blockchain";

type Entry = { player: string; score: bigint; timestamp: bigint };

function shorten(addr: string) { return addr ? addr.slice(0,6) + "…" + addr.slice(-4) : ""; }

export default function Leaderboard() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const provider = getReadProvider();
        const contract = getContract(provider);
        const top = (await contract.getTopScores(100)) as Entry[];
        setRows(top);
      } catch (e: any) {
        setError(e?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        <div className="text-sm text-muted-foreground mb-4">Contract: {LEADERBOARD_ADDRESS}</div>
        {loading ? <div>Loading…</div> : null}
        {error ? <div className="text-red-500">{error}</div> : null}
        {!loading && !error ? (
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-left">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{i+1}</td>
                    <td className="px-4 py-2 font-mono">{shorten(r.player)}</td>
                    <td className="px-4 py-2">{r.score.toString()}</td>
                    <td className="px-4 py-2">{new Date(Number(r.timestamp) * 1000).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr><td className="px-4 py-6 text-center text-muted-foreground" colSpan={4}>No scores yet</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
