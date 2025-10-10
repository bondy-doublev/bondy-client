"use client";

import { useState, useEffect } from "react";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PendingSentRequests() {
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingSent = async () => {
      if (!currentUserId) return;
      setLoading(true);
      try {
        const res = await friendService.getPendingSentRequests(currentUserId);
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSent();
  }, [currentUserId]);

  if (!currentUserId) return <div>Loading user info...</div>;

  return (
    <div className="py-6">
      {loading ? (
        <div className="text-green-700">Đang tải...</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500">Không có lời mời nào đang chờ</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {requests.map((r) => {
            const receiver = r.receiverInfo;
            return (
              <Card
                key={r.id}
                className="bg-yellow-300 text-black p-4 flex flex-col items-center gap-2 shadow"
              >
                <Avatar className="w-20 h-20 rounded-full">
                  {receiver.avatarUrl ? (
                    <AvatarImage
                      src={receiver.avatarUrl}
                      alt={receiver.fullName}
                    />
                  ) : (
                    <AvatarFallback>{receiver.fullName[0]}</AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center mt-2">
                  <div className="font-semibold">{receiver.fullName}</div>
                  <div className="text-sm text-gray-700">Đang chờ phản hồi</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
