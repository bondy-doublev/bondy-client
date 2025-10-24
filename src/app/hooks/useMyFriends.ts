import { Friendship } from "@/models/Friendship";
import { friendService } from "@/services/friendService";
import { useEffect, useState } from "react";

export function useMyFriends(userId: number) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res: Friendship[] = await friendService.getFriends(userId);
      setFriends(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  // Lọc ra user khác currentUser
  const friendUsers = friends.map((f) =>
    f.senderId === userId ? f.receiverInfo : f.senderInfo
  );

  return {
    loading,
    friendUsers,
  };
}
