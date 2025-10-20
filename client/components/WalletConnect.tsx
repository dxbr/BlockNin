import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/blockchain";
import { toast } from "sonner";
import { toFriendlyError } from "@/lib/error-handling";

export interface WalletConnectProps {
  onConnected(address: string): void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const [connectedAddr, setConnectedAddr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      console.log("[wallet] user clicked connect");
      setError(null);
      setConnecting(true);
      const { address } = await connectWallet();
      setConnectedAddr(address);
      toast.success("Wallet Connected", { description: address });
      onConnected(address);
    } catch (e: any) {
      console.error("[wallet] connect error", e);
      const msg = toFriendlyError(e);
      setError(msg);
      toast.error("Connection failed", { description: msg });
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (connectedAddr) {
      console.log("[wallet] Wallet Connected:", connectedAddr);
    }
  }, [connectedAddr]);

  if (connectedAddr) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 font-medium">
        <CheckCircle className="h-5 w-5" />
        <span>Wallet Connected</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className="px-6 py-6 text-base"
      >
        {connecting ? "Connecting…" : "Connect Wallet"}
      </Button>
      {error ? <div className="text-red-400 text-sm">{error}</div> : null}
    </div>
  );
}
