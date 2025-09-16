import { useEffect, useState } from "react";
import { getContract, getReadProvider } from "@/lib/blockchain";
import { Link } from "react-router-dom";

type Entry = { player: string; score: bigint; timestamp: bigint };

function shorten(addr: string) { return addr ? addr.slice(0,6) + "…" + addr.slice(-4) : ""; }

export default function Leaderboard() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchScores = async () => {
      try {
        const provider = getReadProvider();
        const contract = getContract(provider);
        const top = (await contract.getTopScores(1000)) as Entry[];
        const map = new Map<string, Entry>();
        for (const e of top) {
          const addr = e.player.toLowerCase();
          const existing = map.get(addr);
          if (!existing || e.score > existing.score) map.set(addr, e);
        }
        const unique = Array.from(map.values()).sort((a,b) => Number(b.score - a.score));
        if (mounted) setRows(unique);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load leaderboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchScores();
    const id = setInterval(fetchScores, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#000", backgroundImage: "radial-gradient(ellipse at top, #335476 0%, #31506e 11.1%, #304b67 22.2%, #2f4760 33.3%, #2d4359 44.4%, #2c3f51 55.6%, #2a3a4a 66.7%, #293643 77.8%, #28323d 88.9%, #262e36 100%)" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <Link to="/" className="text-white/90 hover:text-white underline-offset-4 hover:underline">Back</Link>
        </div>
        {loading ? <div>Loading…</div> : null}
        {error ? <div className="text-red-400">{error}</div> : null}
        {!loading && !error ? (
          <div className="overflow-x-auto border border-white/10 rounded-md bg-black/20">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="px-4 py-2">{i+1}</td>
                    <td className="px-4 py-2 font-mono">{shorten(r.player)}</td>
                    <td className="px-4 py-2">{r.score.toString()}</td>
                    <td className="px-4 py-2">{new Date(Number(r.timestamp) * 1000).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr><td className="px-4 py-6 text-center text-white/60" colSpan={4}>No scores yet</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
