// "use client";

// import TagsModal from "@/app/[locale]/(client)/home/components/composer/TagModal";
// import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
// import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
// import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogOverlay,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { useAuthStore } from "@/store/authStore";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@radix-ui/react-dropdown-menu";
// import { Globe, Lock, X } from "lucide-react";
// import Image from "next/image";
// import React, { useRef, useState, useEffect } from "react";
// import { BiSolidImage } from "react-icons/bi";
// import { FaVideo, FaUserTag } from "react-icons/fa";
// import { postService } from "@/services/postService";
// import { Toast } from "@/lib/toast";
// import { UserBasic } from "@/models/User";

// export default function PostComposerModal({
//   t,
//   showModal,
//   onClose,
//   placeholder,
//   onPostCreated,
// }: {
//   t: (key: string) => string;
//   showModal: boolean;
//   onClose: () => void;
//   placeholder: string;
//   onPostCreated?: () => void;
// }) {
//   const { user } = useAuthStore();
//   const fullname =
//     (user?.firstName ?? "") +
//     " " +
//     (user?.lastName ?? "") +
//     " " +
//     (user?.middleName ?? "");

//   const imageInputRef = useRef<HTMLInputElement | null>(null);
//   const videoInputRef = useRef<HTMLInputElement | null>(null);
//   const [visibility, setVisibility] = useState(true);

//   const [selectedFiles, setSelectedFiles] = useState<
//     { type: "image" | "video"; url: string; file: File }[]
//   >([]);

//   const editorRef = useRef<HTMLDivElement | null>(null);
//   const [content, setContent] = useState<string>("");

//   const [showTagsModal, setShowTagsModal] = useState(false);
//   const [tagUsers, setTagUsers] = useState<UserBasic[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleImageClick = () => imageInputRef.current?.click();
//   const handleVideoClick = () => videoInputRef.current?.click();

//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "image" | "video"
//   ) => {
//     const files = Array.from(e.target.files || []);
//     if (files.length === 0) return;

//     const newFiles = files.map((file) => ({
//       type,
//       url: URL.createObjectURL(file),
//       file,
//     }));

//     setSelectedFiles((prev) => [...prev, ...newFiles]);
//     e.target.value = "";
//   };

//   const handleEditorInput = () => {
//     const el = editorRef.current;
//     if (!el) return;
//     const text = el.innerText;
//     if (text.length > 1000) {
//       el.innerText = text.slice(0, 1000);
//       placeCaretAtEnd(el);
//     }
//     setContent(el.innerText);
//   };

//   function placeCaretAtEnd(el: HTMLElement) {
//     const range = document.createRange();
//     const sel = window.getSelection();
//     range.selectNodeContents(el);
//     range.collapse(false);
//     sel?.removeAllRanges();
//     sel?.addRange(range);
//   }

//   useEffect(() => {
//     return () => {
//       selectedFiles.forEach((f) => URL.revokeObjectURL(f.url));
//     };
//   }, [selectedFiles]);

//   const handleCreatePost = async () => {
//     if (loading) return;
//     if (!content.trim() && selectedFiles.length === 0) {
//       Toast.error(t("emptyPostWarning") || "Bài viết trống");
//       return;
//     }

//     try {
//       setLoading(true);
//       const files = selectedFiles.map((f) => f.file);
//       await postService.createPost({
//         content,
//         tagUserIds: tagUsers.map((u) => u.id),
//         mediaFiles: files,
//         visibility,
//       });

//       Toast.success(t("postCreated"));
//       setContent("");
//       setSelectedFiles([]);
//       setTagUsers([]);
//       onClose();

//       onPostCreated?.();
//     } catch (error) {
//       console.error(error);
//       Toast.error(t("postFailed"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderTaggedText = () => {
//     if (!tagUsers || tagUsers.length === 0) return null;

//     return (
//       <>
//         {t("with")}{" "}
//         {tagUsers.map((user, index) => (
//           <span key={user.id}>
//             <UserName
//               userId={user.id}
//               fullname={user.fullName}
//               className="font-semibold text-green-700"
//             />
//             {index < tagUsers.length - 1 && ","}
//           </span>
//         ))}
//       </>
//     );
//   };

//   return (
//     <div>
//       <Dialog open={showModal} onOpenChange={onClose}>
//         <DialogOverlay className="fixed inset-0 bg-black/30" />
//         <DialogContent
//           className="
//           w-[90%] md:w-full md:max-w-xl min-h-[60%] max-h-[90%]
//           bg-white rounded-2xl shadow-xl p-0 gap-0 flex flex-col
//           overflow-hidden"
//         >
//           {/* Header */}
//           <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10">
//             <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
//               {t("createNewPost")}
//             </DialogTitle>
//             <DialogClose asChild>
//               <button
//                 className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
//                 aria-label="Close"
//               >
//                 <X size={18} />
//               </button>
//             </DialogClose>
//           </DialogHeader>

//           {/* Body */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             {/* User */}
//             <div className="flex items-center gap-2 p-4 pb-2 shrink-0 relative z-10">
//               {user?.avatarUrl ? (
//                 <UserAvatar userId={user?.id} avatarUrl={user?.avatarUrl} />
//               ) : (
//                 <DefaultAvatar userId={user!.id!} firstName={user?.firstName} />
//               )}
//               <div className="flex flex-col">
//                 <div className="flex flex-wrap gap-1 items-center text-sm leading-tight">
//                   <UserName
//                     userId={Number(user?.id)}
//                     fullname={fullname.trim()}
//                     className="font-semibold"
//                   />
//                   {renderTaggedText()}
//                 </div>

//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:underline transition">
//                       {visibility ? (
//                         <>
//                           <Globe size={14} />
//                           <span className="pt-0.5">{t("public")}</span>
//                         </>
//                       ) : (
//                         <>
//                           <Lock size={14} />
//                           <span className="pt-0.5">{t("private")}</span>
//                         </>
//                       )}
//                     </button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     align="start"
//                     sideOffset={4}
//                     className="p-2 text-sm bg-gray-200 rounded-xl z-[9999]"
//                   >
//                     <DropdownMenuItem
//                       onClick={() => setVisibility(true)}
//                       className="flex items-center gap-2 rounded-xl cursor-pointer hover:bg-gray-300"
//                     >
//                       <Globe size={14} />
//                       <span className="pt-0.5">{t("public")}</span>
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => setVisibility(false)}
//                       className="flex items-center gap-2 rounded-xl cursor-pointer hover:bg-gray-300"
//                     >
//                       <Lock size={14} />
//                       <span className="pt-0.5">{t("private")}</span>
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>

//             {/* Content */}
//             <div className="px-4 flex-1 overflow-y-auto scroll-custom">
//               <div
//                 ref={editorRef}
//                 contentEditable
//                 role="textbox"
//                 spellCheck
//                 onInput={handleEditorInput}
//                 data-placeholder={placeholder}
//                 className={`
//                 relative editable outline-none border-none ring-0
//                 text-gray-900 whitespace-pre-wrap break-words min-h-[120px] pb-4
//                 before:absolute before:text-gray-400 before:content-[attr(data-placeholder)]
//                 before:pointer-events-none before:select-none
//                 ${content.trim() === "" ? "before:block" : "before:hidden"}
//               `}
//               />

//               {selectedFiles.length > 0 && (
//                 <div
//                   className={`
//                   mt-2 grid gap-2
//                   ${
//                     selectedFiles.length === 1
//                       ? "grid-cols-1"
//                       : selectedFiles.length === 2
//                       ? "grid-cols-2"
//                       : "grid-cols-3"
//                   }
//                 `}
//                 >
//                   {selectedFiles.map((file) => (
//                     <div
//                       key={file.url}
//                       className="relative group aspect-square overflow-hidden rounded-lg"
//                     >
//                       {file.type === "image" ? (
//                         <Image
//                           src={file.url}
//                           alt="preview"
//                           fill
//                           sizes="100vw"
//                           className="object-cover"
//                         />
//                       ) : (
//                         <video
//                           src={file.url}
//                           controls
//                           className="w-full h-full object-cover"
//                         />
//                       )}

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setSelectedFiles((prev) =>
//                             prev.filter((x) => x.url !== file.url)
//                           )
//                         }
//                         className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 transition"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="p-4 space-y-4 shrink-0">
//               <div className="flex justify-between items-center rounded-md border p-3">
//                 <p className="text-sm text-gray-700">
//                   {t("addToYourPost") ?? "Thêm vào bài viết của bạn"}
//                 </p>
//                 <div className="flex gap-4">
//                   <button
//                     type="button"
//                     className="rounded-md hover:bg-gray-200 transition p-2"
//                     onClick={handleImageClick}
//                   >
//                     <BiSolidImage color="blue" size={24} />
//                   </button>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     ref={imageInputRef}
//                     onChange={(e) => handleFileChange(e, "image")}
//                     className="hidden"
//                     multiple
//                   />

//                   <button
//                     type="button"
//                     className="rounded-md hover:bg-gray-200 transition p-2"
//                     onClick={handleVideoClick}
//                   >
//                     <FaVideo color="red" size={24} />
//                   </button>
//                   <input
//                     type="file"
//                     accept="video/*,.mkv"
//                     ref={videoInputRef}
//                     onChange={(e) => handleFileChange(e, "video")}
//                     className="hidden"
//                     multiple
//                   />

//                   <button
//                     onClick={() => setShowTagsModal(true)}
//                     className="rounded-md hover:bg-gray-200 transition p-2"
//                   >
//                     <FaUserTag color="green" size={24} />
//                   </button>
//                 </div>
//               </div>

//               <Button
//                 disabled={loading}
//                 className="bg-green-600 hover:bg-green-700 w-full"
//                 onClick={handleCreatePost}
//               >
//                 {loading ? t("posting") ?? "Đang đăng..." : t("post")}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       <TagsModal
//         t={t}
//         showModal={showTagsModal}
//         onClose={() => setShowTagsModal(false)}
//         onSetTagUsers={setTagUsers}
//         initialTagged={tagUsers}
//       />
//     </div>
//   );
// }

"use client";

import TagsModal from "@/app/[locale]/(client)/home/components/composer/TagModal";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Globe, Lock, X, Users, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { BiSolidImage } from "react-icons/bi";
import { FaVideo, FaUserTag } from "react-icons/fa";
import { postService } from "@/services/postService";
import { Toast } from "@/lib/toast";
import { UserBasic } from "@/models/User";
import { useMyFriends } from "@/app/hooks/useMyFriends";

type Mode = "feed" | "message";

export default function PostComposerModal({
  t,
  showModal,
  onClose,
  placeholder,
  onPostCreated,

  originalPostId,
  originalPostPreview,

  onSendAsMessage,
}: {
  t: (key: string) => string;
  showModal: boolean;
  onClose: () => void;
  placeholder: string;
  onPostCreated?: () => void;

  /** có => share mode */
  originalPostId?: number | null;
  originalPostPreview?: React.ReactNode;

  /** gửi share như tin nhắn */
  onSendAsMessage?: (payload: {
    message: string;
    friendIds: number[];
  }) => Promise<void> | void;
}) {
  const { user } = useAuthStore();
  const fullname =
    (user?.firstName ?? "") +
    " " +
    (user?.lastName ?? "") +
    " " +
    (user?.middleName ?? "");

  const isShare = !!originalPostId;

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [visibility, setVisibility] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState<
    { type: "image" | "video"; url: string; file: File }[]
  >([]);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState<string>("");

  const [showTagsModal, setShowTagsModal] = useState(false);
  const [tagUsers, setTagUsers] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== Share/message state =====
  const [mode, setMode] = useState<Mode>("feed");

  const currentUserId = user?.id ?? 0;

  // flag getall
  const { friendUsers } = useMyFriends(currentUserId, {
    getAll: true,
    enabled: isShare,
  });

  const [searchFriend, setSearchFriend] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<number>>(
    new Set()
  );
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredFriends = useMemo(() => {
    const keyword = searchFriend.trim().toLowerCase();
    if (!keyword) return friendUsers;
    return friendUsers.filter((f) =>
      f.fullName?.toLowerCase().includes(keyword)
    );
  }, [friendUsers, searchFriend]);

  useEffect(() => {
    setVisibleCount(20);
  }, [mode, searchFriend, friendUsers.length, showModal]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [selectedFiles]);

  // Share mode: không cho giữ media (phòng trường hợp modal reuse)
  useEffect(() => {
    if (isShare && selectedFiles.length > 0) setSelectedFiles([]);
  }, [isShare]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageClick = () => {
    if (isShare) {
      Toast.error(t("share.noMedia") || "Bài chia sẻ không hỗ trợ ảnh/video");
      return;
    }
    imageInputRef.current?.click();
  };

  const handleVideoClick = () => {
    if (isShare) {
      Toast.error(t("share.noMedia") || "Bài chia sẻ không hỗ trợ ảnh/video");
      return;
    }
    videoInputRef.current?.click();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    if (isShare) {
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      type,
      url: URL.createObjectURL(file),
      file,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleEditorInput = () => {
    const el = editorRef.current;
    if (!el) return;

    const text = el.innerText;
    if (text.length > 1000) {
      el.innerText = text.slice(0, 1000);
      placeCaretAtEnd(el);
    }
    setContent(el.innerText);
  };

  function placeCaretAtEnd(el: HTMLElement) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  const resetAll = () => {
    setMode("feed");
    setVisibility(true);
    setSelectedFiles([]);
    setTagUsers([]);
    setSearchFriend("");
    setSelectedFriendIds(new Set());
    setVisibleCount(20);

    setContent("");
    if (editorRef.current) editorRef.current.innerText = "";
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose();
  };

  const toggleFriend = (id: number) => {
    setSelectedFriendIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const handleFriendListScroll = (
    e: React.UIEvent<HTMLDivElement, UIEvent>
  ) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (isNearBottom && visibleCount < filteredFriends.length) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredFriends.length));
    }
  };

  const renderTaggedText = () => {
    if (!tagUsers || tagUsers.length === 0) return null;

    return (
      <>
        {t("with")}{" "}
        {tagUsers.map((u, idx) => (
          <span key={u.id}>
            <UserName
              userId={u.id}
              fullname={u.fullName}
              className="font-semibold text-green-700"
            />
            {idx < tagUsers.length - 1 && ","}
          </span>
        ))}
      </>
    );
  };

  const canSubmit = useMemo(() => {
    if (mode === "message")
      return selectedFriendIds.size > 0 && !!onSendAsMessage;

    // feed:
    if (isShare) return true; // share cho phép text rỗng
    return !!content.trim() || selectedFiles.length > 0;
  }, [
    mode,
    selectedFriendIds.size,
    onSendAsMessage,
    isShare,
    content,
    selectedFiles.length,
  ]);

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (mode === "message") {
        if (!onSendAsMessage) {
          Toast.error(
            t("share.sendNotSupported") || "Chưa hỗ trợ gửi tin nhắn"
          );
          return;
        }
        const friendIds = Array.from(selectedFriendIds);
        if (friendIds.length === 0) {
          Toast.error(
            t("share.selectAtLeastOneFriend") ||
              "Vui lòng chọn ít nhất 1 người bạn"
          );
          return;
        }

        await onSendAsMessage({ message: content.trim(), friendIds });
        Toast.success(t("share.sent") || "Đã gửi");
        handleClose();
        return;
      }

      // feed
      if (isShare) {
        await postService.createPost({
          content: content.trim(),
          tagUserIds: tagUsers.map((u) => u.id), // ✅ share cũng tag như create
          mediaFiles: [], // ✅ share không có media
          visibility,
          originalPostId: originalPostId!,
        });

        Toast.success(t("share.shared") || "Đã chia sẻ");
        handleClose();
        onPostCreated?.();
        return;
      }

      const files = selectedFiles.map((f) => f.file);
      await postService.createPost({
        content,
        tagUserIds: tagUsers.map((u) => u.id),
        mediaFiles: files,
        visibility,
      });

      Toast.success(t("postCreated"));
      handleClose();
      onPostCreated?.();
    } catch (err) {
      console.error(err);
      Toast.error(
        mode === "feed"
          ? isShare
            ? t("share.shareFailed") || "Chia sẻ thất bại"
            : t("postFailed")
          : t("share.sendFailed") || "Gửi thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={showModal} onOpenChange={handleClose}>
        <DialogOverlay className="fixed inset-0 bg-black/30" />
        <DialogContent
          className="
            w-[90%] md:w-full md:max-w-xl min-h-[60%] max-h-[90%]
            bg-white rounded-2xl shadow-xl p-0 gap-0 flex flex-col
            overflow-hidden
          "
        >
          {/* Header */}
          <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10 relative">
            <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
              {isShare ? t("share.title") || "Chia sẻ" : t("createNewPost")}
            </DialogTitle>
            <DialogClose asChild>
              <button
                className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
                aria-label="Close"
                onClick={handleClose}
              >
                <X size={18} />
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* User + audience */}
            <div className="flex items-center gap-2 p-4 pb-2 shrink-0 relative z-10">
              {user?.avatarUrl ? (
                <UserAvatar userId={user?.id} avatarUrl={user?.avatarUrl} />
              ) : (
                <DefaultAvatar userId={user!.id!} firstName={user?.firstName} />
              )}

              <div className="flex flex-col flex-1">
                <div className="flex flex-wrap gap-1 items-center text-sm leading-tight">
                  <UserName
                    userId={Number(user?.id)}
                    fullname={fullname.trim()}
                    className="font-semibold"
                  />
                  {renderTaggedText()}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:underline transition">
                      {visibility ? (
                        <>
                          <Globe size={14} />
                          <span className="pt-0.5">{t("public")}</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          <span className="pt-0.5">{t("private")}</span>
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="p-2 text-sm bg-gray-200 rounded-xl z-[9999]"
                  >
                    <DropdownMenuItem
                      onClick={() => setVisibility(true)}
                      className="flex items-center gap-2 rounded-xl cursor-pointer hover:bg-gray-300"
                    >
                      <Globe size={14} />
                      <span className="pt-0.5">{t("public")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setVisibility(false)}
                      className="flex items-center gap-2 rounded-xl cursor-pointer hover:bg-gray-300"
                    >
                      <Lock size={14} />
                      <span className="pt-0.5">{t("private")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Content + friends list + preview */}
            <div className="px-4 flex-1 overflow-y-auto scroll-custom">
              {/* Friend selector khi message */}
              {mode === "message" && (
                <div className="mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {t("share.chooseFriends") || "Chọn bạn bè"}
                    </span>
                    {selectedFriendIds.size > 0 && (
                      <span className="text-xs text-green-600">
                        {selectedFriendIds.size}{" "}
                        {t("share.selected") || "đã chọn"}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchFriend}
                      onChange={(e) => setSearchFriend(e.target.value)}
                      placeholder={
                        t("share.searchFriends") || "Tìm kiếm bạn bè..."
                      }
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div
                    onScroll={handleFriendListScroll}
                    className="max-h-48 overflow-y-auto border rounded-lg divide-y scroll-custom"
                  >
                    {filteredFriends.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500">
                        {t("share.noFriendsFound") || "Không tìm thấy bạn nào."}
                      </div>
                    ) : (
                      filteredFriends.slice(0, visibleCount).map((f) => {
                        const checked = selectedFriendIds.has(f.id);
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => toggleFriend(f.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 ${
                              checked ? "bg-green-50" : ""
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-gray-700">
                              {f.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={f.avatarUrl}
                                  alt={f.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>
                                  {f.fullName?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-800">
                                {f.fullName}
                              </div>
                            </div>
                            <div
                              className={`w-4 h-4 border rounded-sm flex items-center justify-center ${
                                checked
                                  ? "bg-green-600 border-green-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {checked && (
                                <div className="w-2 h-2 bg-white rounded-sm" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                role="textbox"
                spellCheck
                onInput={handleEditorInput}
                data-placeholder={
                  mode === "message"
                    ? t("share.saySomethingMessage") ||
                      "Viết gì đó kèm liên kết này..."
                    : isShare
                    ? t("share.saySomething") || "Nói gì đó về nội dung này..."
                    : placeholder
                }
                className={`
                  relative editable outline-none border-none ring-0
                  text-gray-900 whitespace-pre-wrap break-words min-h-[120px] pb-4
                  before:absolute before:text-gray-400 before:content-[attr(data-placeholder)]
                  before:pointer-events-none before:select-none
                  ${content.trim() === "" ? "before:block" : "before:hidden"}
                `}
              />

              {/* Media preview (chỉ create post bình thường) */}
              {mode === "feed" && !isShare && selectedFiles.length > 0 && (
                <div
                  className={`
                    mt-2 grid gap-2
                    ${
                      selectedFiles.length === 1
                        ? "grid-cols-1"
                        : selectedFiles.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }
                  `}
                >
                  {selectedFiles.map((file) => (
                    <div
                      key={file.url}
                      className="relative group aspect-square overflow-hidden rounded-lg"
                    >
                      {file.type === "image" ? (
                        <Image
                          src={file.url}
                          alt="preview"
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={file.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFiles((prev) =>
                            prev.filter((x) => x.url !== file.url)
                          )
                        }
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Original post preview khi share (y như ShareModal cũ) */}
              {mode === "feed" && isShare && (
                <div className="bg-white border rounded-xl overflow-hidden">
                  {originalPostPreview ?? (
                    <div className="p-3 text-xs text-gray-500">
                      {t("share.noPreview") || "Không có preview bài gốc."}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 space-y-3 shrink-0">
              {/* ✅ Row add-to-post: LUÔN GIỐNG CREATE (nhưng share thì disable media) */}
              {mode === "feed" && (
                <div className="flex justify-between items-center rounded-md border p-3">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-700">
                      {t("addToYourPost") ?? "Thêm vào bài viết của bạn"}
                    </p>
                    {isShare && (
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        {t("share.noMediaHint") ||
                          "Bài chia sẻ không hỗ trợ ảnh/video"}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`rounded-md transition p-2 ${
                        isShare
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={handleImageClick}
                      disabled={isShare}
                    >
                      <BiSolidImage color="blue" size={24} />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={imageInputRef}
                      onChange={(e) => handleFileChange(e, "image")}
                      className="hidden"
                      multiple
                      disabled={isShare}
                    />

                    <button
                      type="button"
                      className={`rounded-md transition p-2 ${
                        isShare
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={handleVideoClick}
                      disabled={isShare}
                    >
                      <FaVideo color="red" size={24} />
                    </button>
                    <input
                      type="file"
                      accept="video/*,.mkv"
                      ref={videoInputRef}
                      onChange={(e) => handleFileChange(e, "video")}
                      className="hidden"
                      multiple
                      disabled={isShare}
                    />

                    {/* ✅ Tag luôn giống create (share vẫn tag) */}
                    <button
                      onClick={() => setShowTagsModal(true)}
                      className="rounded-md hover:bg-gray-200 transition p-2"
                      type="button"
                    >
                      <FaUserTag color="green" size={24} />
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ 2 tab FIX NGAY TRÊN NÚT SHARE/POST */}
              {!!onSendAsMessage && (
                <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs font-medium">
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full transition ${
                      mode === "feed"
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-600"
                    }`}
                    onClick={() => setMode("feed")}
                  >
                    <Users size={14} />
                    <span>
                      {isShare
                        ? t("share.shareToFeed") || "Chia sẻ lên tường"
                        : t("post") || "Đăng"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full transition ${
                      mode === "message"
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-600"
                    }`}
                    onClick={() => setMode("message")}
                  >
                    <MessageCircle size={14} />
                    <span>{t("share.sendAsMessage") || "Gửi tin nhắn"}</span>
                  </button>
                </div>
              )}

              <Button
                disabled={loading || !canSubmit}
                className="bg-green-600 hover:bg-green-700 w-full"
                onClick={handleSubmit}
              >
                {loading
                  ? t("posting") ?? "Đang xử lý..."
                  : mode === "message"
                  ? t("share.send") || "Gửi"
                  : isShare
                  ? t("share.shareNow") || "Chia sẻ ngay"
                  : t("post")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TagsModal
        t={t}
        showModal={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        onSetTagUsers={setTagUsers}
        initialTagged={tagUsers}
      />
    </div>
  );
}
