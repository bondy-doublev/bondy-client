"use client";

import { ReelResponse } from "@/types/response";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { reelService } from "@/services/reelService";
import ReelCreateModal from "./ReelCreateModal";
import ReelViewModal from "./ReelViewModal"; // Import Modal mới
import { ReelVisibility } from "@/enums"; // Import enum
import ReelEditModal from "./ReelEditModal";

// Tạo type mới cho Reel để phù hợp với ReelEditModal
interface ReelDataForEdit {
  id: number;
  videoUrl: string;
  visibilityType: ReelVisibility;
  customAllowedUserIds?: number[];
  owner: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
}

export default function VisibleReels() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const { friendUsers } = useMyFriends(userId || 0);

  const [reels, setReels] = useState<ReelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  // State để quản lý Modal Xem
  const [selectedUserIdForView, setSelectedUserIdForView] = useState<
    number | null
  >(null);

  // State để quản lý Modal Chỉnh sửa
  const [reelToEdit, setReelToEdit] = useState<ReelDataForEdit | null>(null);

  // map: userId => hasNewReel
  const [userHasReel, setUserHasReel] = useState<Record<number, boolean>>({});

  const fetchReels = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      let all: ReelResponse[] = [];
      const users = [user, ...friendUsers];

      const hasReelMap: Record<number, boolean> = {};

      for (const u of users) {
        // Giả định reelService.getVisible trả về MyReelResponse[]
        const list = await reelService.getVisible(userId, u.id);
        if (Array.isArray(list) && list.length > 0) {
          all = [...all, ...list];
          hasReelMap[u.id] = true;
        } else {
          hasReelMap[u.id] = false;
        }
      }

      all.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReels(all);
      setUserHasReel(hasReelMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, [userId, friendUsers.length]);

  // get reels của 1 user
  const reelsOfUser = (uid: number) => reels.filter((r) => r.owner.id === uid);

  // Xử lý mở Modal Chỉnh sửa từ Modal Xem
  const handleOpenEdit = (reel: ReelResponse) => {
    // Đóng Modal Xem
    setSelectedUserIdForView(null);
    // Chuẩn bị dữ liệu và mở Modal Chỉnh sửa
    setReelToEdit({
      id: reel.id,
      videoUrl: reel.videoUrl,
      visibilityType: reel.visibilityType,
      customAllowedUserIds: reel.customAllowedUserIds,
      owner: reel.owner,
    });
  };

  // Xử lý đóng Modal Chỉnh sửa
  const handleCloseEdit = () => {
    setReelToEdit(null);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Reels</h3>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Tạo reel
        </button>
      </div>

      {/* Avatars horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto py-2">
        {[user, ...friendUsers].map((u) => (
          <div
            key={u.id}
            className={`flex flex-col items-center cursor-pointer`}
            onClick={() => setSelectedUserIdForView(u.id)}
          >
            <img
              src={u.avatarUrl || "/images/fallback/user.png"}
              alt={u.fullName}
              className={`w-16 h-16 rounded-full p-1
                ${
                  userHasReel[u.id]
                    ? "border-2 border-green-500"
                    : "border border-gray-200"
                }
              `}
            />
            <span className="text-xs mt-1">
              {u.id === userId ? "Bạn" : u?.fullName?.split(" ")[0] || "U"}
            </span>
          </div>
        ))}
      </div>

      {loading && <div className="text-gray-500">Loading reels...</div>}
      {!loading && reels.length === 0 && (
        <div className="text-gray-500 text-sm">No reels available</div>
      )}

      {/* Modal Tạo reel (đã tách) */}
      {openCreate && (
        <ReelCreateModal
          userId={userId || 0}
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={fetchReels}
          friends={friendUsers}
        />
      )}

      {/* Modal Xem reel (đã tách) */}
      {selectedUserIdForView !== null && (
        <ReelViewModal
          currentUserId={userId || 0}
          open={selectedUserIdForView !== null}
          onClose={() => setSelectedUserIdForView(null)}
          onOpenEdit={handleOpenEdit}
          initialReels={reelsOfUser(selectedUserIdForView)}
        />
      )}

      {/* Modal Chỉnh sửa reel (ReelEditModal đã có sẵn) */}
      {reelToEdit && (
        <ReelEditModal
          reel={reelToEdit}
          currentUserId={userId || 0}
          open={reelToEdit !== null}
          onClose={handleCloseEdit}
          onUpdated={() => {
            fetchReels();
            handleCloseEdit();
          }}
          onDeleted={fetchReels}
          friends={friendUsers}
        />
      )}
    </div>
  );
}
