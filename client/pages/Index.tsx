import { useEffect, useMemo, useState } from "react";
import BlockNinja from "@/components/game/BlockNinja";
import WalletConnect from "@/components/WalletConnect";
import "@/components/game/block-ninja.css";
import { getContract, connectWallet } from "@/lib/blockchain";

export default function Index() {
  const [address, setAddress] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (address) {
      console.log("[nav] auto-start game after wallet connect");
    }
  }, [address]);

  async function submitScore(score: number) {
    if (!address) return;
    const confirmed = window.confirm(`Submit score ${score}?`);
    if (!confirmed) return;
    try {
      console.log("[score] submit requested", score);
      setSubmitting(true);
      const { provider } = await connectWallet();
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.submitScore(BigInt(score));
      await tx.wait();
      console.log("[score] submitted");
      alert("Score submitted!");
    } catch (e: any) {
      console.error("[score] submit failed", e);
      alert(e?.message || "Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      {!address ? (
        <div className="block-ninja-gate">
          <div className="text-center">
            <WalletConnect onConnected={(addr) => setAddress(addr)} />
          </div>
        </div>
      ) : (
        <div className="status-badge text-emerald-400 font-medium">Wallet Connected</div>
      )}
      <BlockNinja canPlay={!!address && !submitting} onSubmitScore={submitScore} onAutoStart={() => {}} />
    </div>
  );
}
