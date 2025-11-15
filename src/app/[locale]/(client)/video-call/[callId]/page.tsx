"use client";
import { useParams, useSearchParams } from "next/navigation";
import VideoCallModal from "../../chat/components/VideoCallModal";

export default function VideoCallPage() {
  const params = useParams(); // <-- dùng cho dynamic segment
  const searchParams = useSearchParams(); // query string
  const callId = params.callId; // lấy từ [callId]
  const receiverId = searchParams.get("receiverId"); // vẫn lấy query

  if (!callId) return <div>Invalid call</div>;

  return (
    <div className="w-screen h-screen bg-black">
      <VideoCallModal
        callId={callId}
        receiverId={receiverId}
        onClose={() => window.close()}
      />
    </div>
  );
}
