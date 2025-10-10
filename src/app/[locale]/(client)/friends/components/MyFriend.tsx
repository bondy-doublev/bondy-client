"use client";

import { useState, useEffect } from "react";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Friendship } from "@/models/Friendship";

export default function MyFriends() {
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res: Friendship[] = await friendService.getFriends(currentUserId);
      setFriends(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUserId]);

  if (!currentUserId) return <div>Loading user info...</div>;

  // Lọc ra user khác currentUser
  const friendUsers = friends.map((f) =>
    f.senderId === currentUserId ? f.receiverInfo : f.senderInfo
  );

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">
        Danh sách bạn bè
      </h1>
      {loading ? (
        <div className="text-green-700">Đang tải...</div>
      ) : friendUsers.length === 0 ? (
        <div className="text-gray-500">Bạn chưa có bạn bè nào</div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {friendUsers.map((f) => (
              <Card
                key={f.id}
                className="bg-green-100 text-black p-4 flex flex-col items-center gap-2 shadow"
              >
                <Avatar className="w-20 h-20 rounded-full">
                  {f.avatarUrl ? (
                    <AvatarImage src={f.avatarUrl} alt={f.fullName} />
                  ) : (
                    <AvatarFallback>{f.fullName[0]}</AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center mt-2">
                  <div className="font-semibold">{f.fullName}</div>
                  {f.address && (
                    <div className="text-sm text-gray-700">{f.address}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
