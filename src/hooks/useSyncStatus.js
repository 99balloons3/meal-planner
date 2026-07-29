import { useEffect, useState } from "react";
import { isOnline, onNetworkChange, onQueueChange, queueLength } from "../lib/sync";

export function useSyncStatus() {
  const [online, setOnline] = useState(isOnline());
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const offNet = onNetworkChange(() => setOnline(isOnline()));
    const offQueue = onQueueChange(async () => setPending(await queueLength()));
    queueLength().then(setPending);
    return () => {
      offNet();
      offQueue();
    };
  }, []);

  return { online, pending };
}
