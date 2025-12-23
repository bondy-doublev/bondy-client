"use client";

import { ReelResponse } from "@/types/response";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { reelService } from "@/services/reelService";
import ReelCreateModal from "./ReelCreateModal";
import ReelViewModal from "./ReelViewModal"; // Import Modal mới
import { ReelVisibility } from "@/enums"; // Import enum
import ReelEditModal from "./ReelEditModal";
import { useTranslations } from "use-intl";

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

export type ReelAction = "viewed" | "read";

export default function VisibleReels() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const [reels, setReels] = useState<ReelResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const t = useTranslations("reel");

  // State để quản lý Modal Xem
  const [selectedUserIdForView, setSelectedUserIdForView] = useState<
    number | null
  >(null);

  // State để quản lý Modal Chỉnh sửa
  const [reelToEdit, setReelToEdit] = useState<ReelDataForEdit | null>(null);

  // map: userId => hasNewReel
  const countReels = (uid: number) => reelsOfUser(uid).length;

  const fetchReels = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const fetchReels = await reelService.getVisible();

      setReels(fetchReels || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, [userId]);

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

  const isReadAll = (ownerId: number) => {
    const ownerReels = reels.filter((r) => r.owner.id === ownerId);
    if (ownerReels.length === 0) return true;
    return ownerReels.every((r) => r.isRead === true);
  };

  const markViewedOrRead = (reelId: number, action: ReelAction) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id !== reelId) return r;

        if (action === "viewed") {
          return { ...r, viewCount: (r.viewCount ?? 0) + 1 };
        }

        // action === "read"
        return { ...r, isRead: true };
      })
    );
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{t("reels")}</h3>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          {t("createReel")}
        </button>
      </div>

      {/* Avatars horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto py-2 scroll-custom">
        {(() => {
          // 1) Lấy unique users từ reels.owner + user hiện tại
          const map = new Map<number, any>();

          if (user?.id) {
            map.set(user.id, {
              id: user.id,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl,
            });
          }

          for (const r of reels) {
            const o = r.owner;
            if (!o?.id) continue;
            if (!map.has(o.id)) {
              map.set(o.id, {
                id: o.id,
                fullName: o.fullName,
                avatarUrl: o.avatarUrl,
              });
            }
          }

          const users = Array.from(map.values());

          // 2) Sort theo đúng logic bạn đang dùng
          users.sort((a, b) => {
            const aCount = countReels(a?.id || 0);
            const bCount = countReels(b?.id || 0);

            // User có reel đứng trước
            if (aCount > 0 && bCount === 0) return -1;
            if (aCount === 0 && bCount > 0) return 1;

            // Nếu cả hai đều có reel → sort theo reel mới nhất
            if (aCount > 0 && bCount > 0) {
              const aLatest = new Date(
                reelsOfUser(a?.id || 0)[0].createdAt
              ).getTime();
              const bLatest = new Date(
                reelsOfUser(b?.id || 0)[0].createdAt
              ).getTime();
              return bLatest - aLatest;
            }

            // Cả hai đều không có reel → giữ nguyên
            return 0;
          });

          // 3) Render
          return users.map((u) => {
            const hasReel = reelsOfUser(u?.id || 0).length > 0;

            return (
              <div
                key={u.id}
                className={`flex flex-col items-center shrink-0 ${
                  hasReel ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
                onClick={() => {
                  if (!hasReel) return;
                  setSelectedUserIdForView(u?.id || 0);
                }}
              >
                <img
                  src={u?.avatarUrl || "/images/fallback/user.png"}
                  alt={u?.fullName || "User"}
                  className={`w-16 h-16 rounded-full p-1 ${
                    hasReel && !isReadAll(u.id)
                      ? "border-2 border-green-500"
                      : "border border-gray-200"
                  }`}
                />
                <span className="text-xs mt-1">
                  {u?.id === userId
                    ? t("you")
                    : u?.fullName?.split(" ")[0] || "U"}
                </span>
              </div>
            );
          });
        })()}
      </div>

      {loading && <div className="text-gray-500">{t("loadingMore")}</div>}

      {/* Modal Tạo reel (đã tách) */}
      {openCreate && (
        <ReelCreateModal
          userId={userId || 0}
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={fetchReels}
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
          onMarkViewdOrRead={markViewedOrRead}
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
        />
      )}
    </div>
  );
}
