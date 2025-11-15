import { createContext, useContext, useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/configs/firebase";

interface CallContextType {
  incomingCallId: string | null;
  setIncomingCallId: (id: string | null) => void;
  outgoingCallId: string | null;
  setOutgoingCallId: (id: string | null) => void;
  outgoingCallReceiver: string | null;
  setOutgoingCallReceiver: (id: string | null) => void;
  currentUserId: number | null;
}

const CallContext = createContext<CallContextType>({
  incomingCallId: null,
  setIncomingCallId: () => {},
  outgoingCallId: null,
  setOutgoingCallId: () => {},
  outgoingCallReceiver: null,
  setOutgoingCallReceiver: () => {},
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
  const [outgoingCallId, setOutgoingCallId] = useState<string | null>(null);
  const [outgoingCallReceiver, setOutgoingCallReceiver] = useState<
    string | null
  >(null);

  // Listen incoming calls
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "calls"),
      where("receiverIds", "array-contains", currentUserId),
      where("status", "==", "ringing")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") setIncomingCallId(change.doc.id);
      });
    });

    return () => unsub();
  }, [currentUserId]);

  return (
    <CallContext.Provider
      value={{
        incomingCallId,
        setIncomingCallId,
        outgoingCallId,
        setOutgoingCallId,
        outgoingCallReceiver,
        setOutgoingCallReceiver,
        currentUserId,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
