"use client";

import { useState, useEffect } from "react";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Friendship } from "@/models/Friendship"; // kiểu mới

export default function FriendRequests() {
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [requests, setRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await friendService.getPendingRequests(currentUserId);
      setRequests(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (friendship: Friendship) => {
    try {
      await friendService.acceptFriendRequest(
        friendship.receiverId,
        friendship.senderId
      );
      // Xóa khỏi state
      setRequests((prev) => prev.filter((r) => r.id !== friendship.id));
    } catch (err) {
      console.error(err);
      alert("Failed to accept request");
    }
  };

  const handleReject = async (friendship: Friendship) => {
    try {
      await friendService.rejectFriendRequest(
        friendship.receiverId,
        friendship.senderId
      );
      // Xóa khỏi state
      setRequests((prev) => prev.filter((r) => r.id !== friendship.id));
    } catch (err) {
      console.error(err);
      alert("Failed to reject request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUserId]);

  if (!currentUserId) return <div>Loading user info...</div>;

  return (
    <div className="py-6 mx-auto">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">
        Lời mời kết bạn
      </h1>
      {loading ? (
        <div className="text-green-700">Đang tải...</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500">Không có lời mời kết bạn nào</div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {requests.map((f) => {
              const sender = f.senderInfo;
              return (
                <Card
                  key={f.id}
                  className="bg-green-100 text-black p-4 flex flex-col items-center gap-2 shadow"
                >
                  <Avatar className="w-20 h-20 rounded-full">
                    {sender?.avatarUrl ? (
                      <AvatarImage
                        src={sender.avatarUrl}
                        alt={sender.fullName}
                      />
                    ) : (
                      <AvatarFallback>{sender?.fullName[0]}</AvatarFallback>
                    )}
                  </Avatar>

                  <div className="text-center">
                    <div className="font-semibold">{sender?.fullName}</div>
                  </div>

                  <div className="flex gap-2 mt-2 w-full">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                      onClick={() => handleAccept(f)}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-green-700 border-green-500 hover:bg-green-100"
                      onClick={() => handleReject(f)}
                    >
                      Xóa
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
