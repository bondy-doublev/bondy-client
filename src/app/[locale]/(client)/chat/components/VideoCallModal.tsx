"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { useAuthStore } from "@/store/authStore";

interface Props {
  callId: string | null;
  onClose: () => void;
  receiverId: string | null;
}

export default function VideoCallModal({ callId, onClose, receiverId }: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!callId) return;

    startCall();
  }, [callId]);

  async function startCall() {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream.getTracks().forEach((t) => pc.current!.addTrack(t, stream));

    if (localRef.current) localRef.current.srcObject = stream;

    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    // local ICE → Firestore
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    // remote stream
    pc.current.ontrack = (event) => {
      remoteRef.current!.srcObject = event.streams[0];
    };

    // Create offer
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    await setDoc(callDoc, {
      offer,
      callerId: user!.id,
      status: "ringing",
      receiverId,
    });

    // Lắng nghe answer
    onSnapshot(callDoc, async (snapshot) => {
      const data = snapshot.data();
      if (!pc.current) return;
      if (!pc.current.currentRemoteDescription && data?.answer) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setLoading(false);
      }
    });

    // Lắng nghe candidate từ B
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
  }

  useEffect(() => {
    if (!callId) return;
    const unsub = onSnapshot(doc(db, "calls", callId), (snap) => {
      const data = snap.data();
      if (!data) return;

      if (data.status === "rejected" || data.status === "ended") {
        onClose(); // A tắt modal
      }
    });
    return () => unsub();
  }, [callId]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-[700px]">
        <h2 className="text-lg font-bold mb-2">Video Call</h2>

        <div className="flex gap-2">
          <video ref={localRef} autoPlay muted className="w-1/2 rounded" />
          <video ref={remoteRef} autoPlay className="w-1/2 rounded" />
        </div>

        {loading && <p className="mt-2 text-sm text-gray-500">Waiting...</p>}

        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          End Call
        </button>
      </div>
    </div>
  );
}
