"use client";

import { useState, useEffect } from "react";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FriendSuggest } from "@/models/Friendship";

export default function FriendSuggestion() {
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [suggestions, setSuggestions] = useState<FriendSuggest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await friendService.suggestFriends(currentUserId);
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiverId: number) => {
    try {
      const res = await friendService.sendFriendRequest(
        currentUserId,
        receiverId
      );

      // Nếu response.success === true thì update nút
      if (res && res.success) {
        setSuggestions((prev) =>
          prev.map((s) =>
            s.userId === receiverId ? { ...s, isPending: true } : s
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send friend request");
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [currentUserId]);

  if (!currentUserId) return <div>Loading user info...</div>;

  return (
    <div className="py-6 mx-auto">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">
        Gợi ý bạn bè
      </h1>
      {loading ? (
        <div className="text-green-700">Đang tải...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-gray-500">Không có gợi ý nào</div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {suggestions.map((s) => (
              <Card
                key={s.userId}
                className="bg-green-100 text-black p-4 flex flex-col items-center gap-2 shadow"
              >
                <Avatar className="w-20 h-20 rounded-full">
                  {s.avatarUrl ? (
                    <AvatarImage src={s.avatarUrl} alt={s.fullName} />
                  ) : (
                    <AvatarFallback>{s.fullName[0]}</AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center mt-2">
                  <div className="font-semibold">{s.fullName}</div>
                  <div className="text-sm text-gray-700">
                    {s.mutualFriends > 0 && `${s.mutualFriends} bạn chung`}
                    {s.nearBy && (s.mutualFriends > 0 ? ", " : "") + "Gần bạn"}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-2 w-full bg-green-600 hover:bg-green-500 text-white"
                  onClick={() => handleSendRequest(s.userId)}
                  disabled={s.isPending}
                >
                  {s.isPending ? "Đang chờ" : "Kết bạn"}
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
