"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { useRingtone } from "@/app/hooks/useRingTone";

interface Props {
  callId: string;
  onClose: () => void;
}

export default function IncomingCallModal({ callId, onClose }: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const [accepted, setAccepted] = useState(false);
  const [callStatus, setCallStatus] = useState("ringing"); // trạng thái realtime
  useRingtone(!accepted && callStatus === "ringing"); // bật chuông khi ringing

  async function acceptCall() {
    setAccepted(true);

    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    // Local stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream.getTracks().forEach((t) => pc.current!.addTrack(t, stream));
    if (localRef.current) localRef.current.srcObject = stream;

    pc.current.ontrack = (event) => {
      remoteRef.current!.srcObject = event.streams[0];
    };

    // ICE → Firestore
    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // 1. Lấy offer từ Firestore
    const snap = await import("firebase/firestore").then(({ getDoc }) =>
      getDoc(callDoc)
    );
    const data = snap.data();
    if (!data?.offer) return;

    await pc.current.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    // 2. Tạo answer
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);

    await updateDoc(callDoc, { answer });

    // 3. Nghe ICE từ A
    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });

    await updateDoc(callDoc, {
      status: "accepted",
    });
  }

  const handleReject = async () => {
    const callDoc = doc(db, "calls", callId);
    await updateDoc(callDoc, { status: "rejected" });
    onClose();
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "calls", callId), (snap) => {
      const data = snap.data();
      if (!data) return;
      setCallStatus(data.status);

      if (data.status === "rejected" || data.status === "ended") {
        onClose(); // đóng modal nếu bị reject hoặc kết thúc
      }
    });
    return () => unsub();
  }, [callId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] p-5 rounded-lg shadow-lg z-50">
        {!accepted ? (
          <>
            <h3 className="text-xl font-semibold mb-4">📞 Incoming call...</h3>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={handleReject}
              >
                Decline
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={acceptCall}
              >
                Accept
              </button>
            </div>
          </>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-3">Video Call</h3>
            <div className="flex gap-2">
              <video ref={localRef} autoPlay muted className="w-1/2 rounded" />
              <video ref={remoteRef} autoPlay className="w-1/2 rounded" />
            </div>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={onClose}
            >
              End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
