import { createContext, useContext, useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/configs/firebase";

interface CallContextType {
  incomingCallId: string | null;
  setIncomingCallId: (id: string | null) => void;
  currentUserId: number | null;
}

const CallContext = createContext<CallContextType>({
  incomingCallId: null,
  setIncomingCallId: () => {},
  currentUserId: null,
});

export const CallProvider = ({
  children,
  currentUserId,
}: {
  children: React.ReactNode;
  currentUserId: number;
}) => {
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "calls"),
      where("receiverIds", "array-contains", currentUserId),
      where("status", "==", "ringing")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setIncomingCallId(change.doc.id);
        }
      });
    });

    return () => unsub();
  }, [currentUserId]);

  return (
    <CallContext.Provider
      value={{ incomingCallId, setIncomingCallId, currentUserId }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
