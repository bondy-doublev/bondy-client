"use client";
import { useCall } from "@/context/CallContext";
import VideoCallModal from "./VideoCallModal";
import IncomingCallModal from "./IncomingCallModal";

export default function GlobalVideoCall() {
  const {
    incomingCallId,
    setIncomingCallId,
    outgoingCallId,
    setOutgoingCallId,
    outgoingCallReceiver,
  } = useCall();

  return (
    <>
      {incomingCallId && (
        <IncomingCallModal
          callId={incomingCallId}
          onClose={() => setIncomingCallId(null)}
        />
      )}
      {outgoingCallId && (
        <VideoCallModal
          callId={outgoingCallId}
          receiverId={outgoingCallReceiver} // hoặc truyền receiverId khi gọi đi
          onClose={() => setOutgoingCallId(null)}
        />
      )}
    </>
  );
}
