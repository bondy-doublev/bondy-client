"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { useAuthStore } from "@/store/authStore";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";
import { Rnd } from "react-rnd";
import { useTranslations } from "use-intl";

interface Props {
  callId: string | null;
  onClose: () => void;
  receiverId: string | null;
}

export default function VideoCallModal({ callId, onClose, receiverId }: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const localStreamRef = useRef<MediaStream | null>(null);
  const t = useTranslations("chat");

  useEffect(() => {
    if (callId) {
      console.log(t("VideoCallModal is opening for callId:"), callId);
      startCall();
    }
  }, [callId]);

  const startCall = async () => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;

    // Add tracks to peer connection
    stream.getTracks().forEach((t) => pc.current!.addTrack(t, stream));
    if (localRef.current) localRef.current.srcObject = stream;

    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.current.onicecandidate = (event) => {
      if (event.candidate) addDoc(offerCandidates, event.candidate.toJSON());
    };

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

    // Listen for answer
    onSnapshot(callDoc, async (snap) => {
      const data = snap.data();
      if (!data || !pc.current) return;
      if (!pc.current.currentRemoteDescription && data.answer) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setLoading(false);
      }
      if (data.status === "ended" || data.status === "rejected") {
        onClose();
      }
    });

    // Listen for answer candidates
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = !micOn));
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => (track.enabled = !camOn));
    setCamOn(!camOn);
  };

  const endCall = async () => {
    if (pc.current) {
      pc.current.getSenders().forEach((sender) => sender.track?.stop());
      pc.current.close();
    }
    if (callId) {
      const callDoc = doc(db, "calls", callId);
      await updateDoc(callDoc, { status: "ended" });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <Rnd
        default={{ x: 100, y: 100, width: 700, height: 400 }}
        bounds="window"
        minWidth={300}
        minHeight={200}
        className="bg-black rounded-lg overflow-hidden flex flex-col shadow-lg pointer-events-auto"
      >
        {/* Remote video */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
        />

        {/* Local video small preview */}
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-4 right-4 w-32 h-24 object-cover rounded border border-white"
        />

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 px-4 py-2 rounded-full items-center">
          <button
            onClick={toggleMic}
            className="bg-white/30 hover:bg-white/50 text-white p-2 rounded-full"
          >
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button
            onClick={toggleCam}
            className="bg-white/30 hover:bg-white/50 text-white p-2 rounded-full"
          >
            {camOn ? <FaVideo /> : <FaVideoSlash />}
          </button>
          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
          >
            <FaPhoneSlash />
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-semibold">
            {t("connecting")}
          </div>
        )}
      </Rnd>
    </div>
  );
}
