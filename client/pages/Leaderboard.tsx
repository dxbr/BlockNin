import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getReadProvider, getContract } from "@/lib/blockchain";

interface ScoreEntry {
  player: string;
  score: bigint;
  timestamp: bigint;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      const provider = getReadProvider();
      const contract = getContract(provider);
      const topScores = await contract.getTopScores(20);
      setScores(topScores);
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      setError(err?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }

  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatTimestamp(timestamp: bigint) {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white p-6"
      style={{
        backgroundColor: "#000",
        backgroundImage:
          "radial-gradient(ellipse at top, #335476 0%, #31506e 11.1%, #304b67 22.2%, #2f4760 33.3%, #2d4359 44.4%, #2c3f51 55.6%, #2a3a4a 66.7%, #293643 77.8%, #28323d 88.9%, #262e36 100%)",
      }}
    >
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Leaderboard
          </h1>
          <p className="text-white/70 text-sm">Top 20 Players on Monad Testnet</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
            <p className="mt-4 text-white/70">Loading scores...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && scores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">No scores yet. Be the first to play!</p>
          </div>
        )}

        {!loading && !error && scores.length > 0 && (
          <div className="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scores.map((entry, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <span className="text-2xl mr-2">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-2xl mr-2">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-2xl mr-2">🥉</span>
                          )}
                          <span className="text-white font-semibold">
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-blue-300 font-mono text-sm">
                          {formatAddress(entry.player)}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                          {entry.score.toString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white/70">
                        {formatTimestamp(entry.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center mt-8 flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all hover:scale-105 font-semibold"
          >
            ← Back to Game
          </Link>
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all hover:scale-105 font-semibold"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
