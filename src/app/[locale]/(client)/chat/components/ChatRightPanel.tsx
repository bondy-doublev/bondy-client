"use client";
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Users, Image, Upload, X, Edit2, Check } from "lucide-react";
import { chatService } from "@/services/chatService";
import { userService } from "@/services/userService";
import { uploadCloudinarySingle } from "@/services/uploadService";
import { useRouter } from "next/navigation";
import { useTranslations } from "use-intl";
import { resolveFileUrl } from "@/utils/fileUrl";

interface Member {
  id: number;
  name: string;
  avatar?: string;
}

interface ChatRightPanelProps {
  isGroup: boolean;
  selectedRoom: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomUpdated: () => void;
}

export const ChatRightPanel: React.FC<ChatRightPanelProps> = ({
  isGroup,
  selectedRoom,
  open,
  onOpenChange,
  onRoomUpdated,
}) => {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [groupAvatar, setGroupAvatar] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [groupName, setGroupName] = React.useState<string>("");
  const [editingName, setEditingName] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [media, setMedia] = React.useState<any[]>([]);
  const router = useRouter();
  const t = useTranslations("chat");

  // Fetch room info
  React.useEffect(() => {
    if (!selectedRoom) return;

    const fetchRoomInfo = async () => {
      try {
        // Lấy media/file
        const roomMedia = await chatService.getRoomFiles(selectedRoom);
        setMedia(roomMedia); // set vào state media

        if (!isGroup) return;

        // Lấy thông tin phòng
        const roomInfo = await chatService.getRoomInformation(selectedRoom);
        setGroupName(roomInfo.name);
        setGroupAvatar(roomInfo.avatar || "");

        // Lấy members kèm profile
        const membersWithProfile = await Promise.all(
          roomInfo.members.map(async (m: any) => {
            try {
              const profile = await userService.getBasicProfile(m.userId);
              return {
                id: m.userId,
                name: profile.data.fullName,
                avatar: profile.data.avatarUrl,
              };
            } catch {
              return { id: m.userId, name: `${t("user")} ${m.userId}` };
            }
          })
        );
        setMembers(membersWithProfile);
      } catch (err) {
        console.error(t("failedToFetchRoomMembers"), err);
      }
    };

    fetchRoomInfo();
  }, [selectedRoom, isGroup]);

  // Change avatar handler
  const handleAvatarChange = async (file: File) => {
    try {
      setLoading(true);
      const url = await uploadCloudinarySingle(file);
      setGroupAvatar(url);
      if (selectedRoom) {
        await chatService.updateRoomInformation(selectedRoom, {
          avatarUrl: url,
        });
      }
    } catch (err) {
      console.error(t("failedToUploadAvatar"), err);
    } finally {
      setLoading(false);
      onRoomUpdated();
    }
  };

  // Change name handler
  const handleNameChange = async () => {
    if (!selectedRoom) return;
    try {
      await chatService.updateRoomInformation(selectedRoom, {
        name: groupName,
      });
      setEditingName(false);
    } catch (err) {
      console.error(t("failedToUpdateGroupName"), err);
    } finally {
      onRoomUpdated();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] p-0 flex flex-col bg-white"
      >
        <SheetHeader className="bg-gradient-to-r bg-green text-white px-6 py-5 shrink-0 shadow-md">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-xl font-bold">
              {t("chatInfo")}
            </SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6">
          {isGroup && (
            <>
              {/* Group Avatar & Name Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200 flex flex-col items-center">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    src={resolveFileUrl(groupAvatar) || "/default-group.png"}
                    alt="Group Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
                  />
                  <div className="absolute inset-0 bg-emerald-600/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files?.[0]) return;
                    handleAvatarChange(e.target.files[0]);
                  }}
                />
                <Button
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg px-6 py-2"
                >
                  <Upload className="w-4 h-4 mr-2" />{" "}
                  {loading ? t("uploadingAvatar") : t("changeAvatar")}
                </Button>

                {/* Edit group name */}
                <div className="mt-4 flex items-center gap-2">
                  {editingName ? (
                    <>
                      <input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="border px-2 py-1 rounded-md"
                      />
                      <Button size="sm" onClick={handleNameChange}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold">{groupName}</h2>
                      <button onClick={() => setEditingName(true)}>
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Members Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-emerald-100">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-800">
                    {t("members")} ({members.length})
                  </h4>
                </div>
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {members.map((m) => (
                    <li
                      onClick={() => router.push(`/user/${m.id}`)}
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200 hover:border-emerald-400 hover:shadow-md"
                    >
                      {m.avatar ? (
                        <img
                          src={resolveFileUrl(m.avatar)}
                          alt={m.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-500 shadow-md">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">
                        {m.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Media Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-emerald-100">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Image className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-lg text-gray-800">
                {t("media")} ({media.length})
              </h4>
            </div>
            {media.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {media.map((f, i) => {
                  const url =
                    f instanceof File ? URL.createObjectURL(f) : f.url;
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group overflow-hidden rounded-lg border-2 border-emerald-300 hover:border-emerald-500 transition-all shadow-md hover:shadow-xl"
                    >
                      <img
                        src={resolveFileUrl(url)}
                        alt={`${t("media")} ${i + 1}`}
                        className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-emerald-50 rounded-lg">
                <Image className="w-16 h-16 mx-auto mb-3 opacity-30 text-emerald-300" />
                <p className="text-sm text-gray-500">{t("noMediaSharedYet")}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
