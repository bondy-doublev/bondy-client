"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { useRingtone } from "@/app/hooks/useRingTone";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaCamera,
  FaPhoneAlt,
} from "react-icons/fa";
import { Rnd } from "react-rnd";
import { useTranslations } from "use-intl";

interface Props {
  callId: string;
  onClose: () => void;
}

export default function IncomingCallModal({ callId, onClose }: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [accepted, setAccepted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callStatus, setCallStatus] = useState("ringing");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const t = useTranslations("chat");

  useRingtone(!accepted && callStatus === "ringing");

  // Lấy danh sách thiết bị khi mở modal
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devs) => {
      setDevices(
        devs.filter((d) => d.kind === "videoinput" || d.kind === "audioinput")
      );
    });
  }, []);

  const acceptCall = async () => {
    if (!selectedVideo || !selectedAudio)
      return alert(t("selectCameraAndMicFirst"));

    setAccepted(true);

    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: selectedVideo } },
      audio: { deviceId: { exact: selectedAudio } },
    });

    localStreamRef.current = stream;
    stream.getTracks().forEach((t) => pc.current!.addTrack(t, stream));
    if (localRef.current) localRef.current.srcObject = stream;

    pc.current.ontrack = (event) => {
      remoteRef.current!.srcObject = event.streams[0];
    };

    pc.current.onicecandidate = async (event) => {
      if (event.candidate)
        await addDoc(answerCandidates, event.candidate.toJSON());
    };

    const snap = await getDoc(callDoc);
    const data = snap.data();
    if (!data?.offer) return;

    await pc.current.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    await updateDoc(callDoc, { answer, status: "accepted" });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
  };

  const endCall = async () => {
    if (pc.current) {
      pc.current.getSenders().forEach((s) => s.track?.stop());
      pc.current.close();
    }
    if (localStreamRef.current)
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    const callDoc = doc(db, "calls", callId);
    await updateDoc(callDoc, { status: "ended" });
    onClose();
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getAudioTracks()
      .forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getVideoTracks()
      .forEach((t) => (t.enabled = !camOn));
    setCamOn(!camOn);
  };

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
      if (data.status === "ended" || data.status === "rejected") endCall();
    });
    return () => unsub();
  }, [callId]);

  return (
    <Rnd
      default={{ x: 100, y: 100, width: 700, height: accepted ? 400 : 300 }}
      bounds="window"
      minWidth={300}
      minHeight={200}
      className="fixed z-50 rounded-lg shadow-lg flex flex-col overflow-hidden"
    >
      {!accepted ? (
        <div className="bg-white w-full h-full p-5 rounded-lg">
          <h3 className="flex items-center text-xl font-semibold mb-4 text-gray-800 gap-2">
            <FaPhoneAlt className="text-green-500" />
            {t("incomingCall")}
          </h3>

          {/* Chọn thiết bị */}
          <div className="mb-4 flex flex-col gap-3">
            {/* Camera */}
            <div className="flex items-center gap-2">
              <FaCamera className="text-gray-600" />
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedVideo || ""}
                onChange={(e) => setSelectedVideo(e.target.value)}
              >
                <option value="">{t("selectCamera")}</option>
                {devices
                  .filter((d) => d.kind === "videoinput")
                  .map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || d.deviceId}
                    </option>
                  ))}
              </select>
            </div>

            {/* Microphone */}
            <div className="flex items-center gap-2">
              <FaMicrophone className="text-gray-600" />
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedAudio || ""}
                onChange={(e) => setSelectedAudio(e.target.value)}
              >
                <option value="">{t("selectMicrophone")}</option>
                {devices
                  .filter((d) => d.kind === "audioinput")
                  .map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || d.deviceId}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={handleReject}
            >
              {t("decline")}
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={acceptCall}
            >
              {t("accept")}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative bg-black w-full h-full rounded-lg overflow-hidden flex flex-col">
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black"
          />
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="absolute bottom-4 right-4 w-32 h-24 object-cover rounded border border-white"
          />

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
        </div>
      )}
    </Rnd>
  );
}
