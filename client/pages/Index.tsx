import { useEffect, useState } from "react";
import BlockNinja from "@/components/game/BlockNinja";
import WalletConnect from "@/components/WalletConnect";
import "@/components/game/block-ninja.css";
import {
  getContract,
  connectWallet,
  detectInjectedProvider,
  getCachedWalletAddress,
  restoreWalletConnection,
  setCachedWalletAddress,
} from "@/lib/blockchain";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [address, setAddress] = useState<string | null>(() =>
    getCachedWalletAddress(),
  );
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const restored = await restoreWalletConnection();
        if (!active) return;
        if (restored?.address) {
          setAddress(restored.address);
        } else {
          setAddress((prev) => (prev ? null : prev));
        }
      } catch (err) {
        console.warn("[wallet] restore failed", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCachedWalletAddress(address);
  }, [address]);

  useEffect(() => {
    const injected = detectInjectedProvider();
    if (!injected?.on) return;
    const handleAccountsChanged = (accounts: string[] = []) => {
      const next = accounts.length ? accounts[0] : null;
      setAddress((prev) => (prev === next ? prev : next));
    };
    injected.on("accountsChanged", handleAccountsChanged);
    return () => {
      if (typeof injected.removeListener === "function") {
        injected.removeListener("accountsChanged", handleAccountsChanged);
      } else if (typeof injected.off === "function") {
        injected.off("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (address) {
      console.log("[nav] auto-start game after wallet connect");
    }
  }, [address]);

  async function submitScore(score: number) {
    if (!address) return;
    setPendingScore(score);
    setConfirmOpen(true);
  }

  async function confirmSubmit() {
    if (!address || pendingScore == null) return;
    try {
      console.log("[score] submit requested", pendingScore);
      setSubmitting(true);
      setConfirmOpen(false);
      const { provider } = await connectWallet();
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.submitScore(BigInt(pendingScore));
      toast("Submitting score…");
      await tx.wait();
      console.log("[score] submitted");
      toast.success("Score submitted");
    } catch (e: any) {
      const code: number | undefined = e?.code ?? e?.info?.error?.code;
      const message: string = e?.message || String(e);
      const rejected =
        code === 4001 ||
        /user rejected/i.test(message) ||
        /denied transaction/i.test(message);
      if (rejected) {
        toast("Transaction rejected");
      } else {
        console.error("[score] submit failed", e);
        toast.error("Submit failed", {
          description: message || "Failed to submit score",
        });
      }
    } finally {
      setSubmitting(false);
      setPendingScore(null);
    }
  }

  return (
    <div className="relative">
      {!address ? (
        <div className="block-ninja-gate">
          <div className="text-center space-y-4">
            <div className="text-white/80 text-lg">
              Connect your wallet to play
            </div>
            <WalletConnect
              onConnected={(addr) => {
                setAddress(addr);
              }}
            />
          </div>
        </div>
      ) : null}
      <BlockNinja
        canPlay={!!address && !submitting}
        onSubmitScore={submitScore}
        onAutoStart={() => {}}
        onRequireWallet={() => toast("Connect your wallet to play")}
        onOpenLeaderboard={() => navigate("/leaderboard")}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Score</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingScore != null
                ? `Do you want to submit your score of ${pendingScore}?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={submitting}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
