// "use client";

// import PostActions from "@/app/[locale]/(client)/home/components/post/PostActions";
// import PostContent from "@/app/[locale]/(client)/home/components/post/PostContent";
// import PostHeader from "@/app/[locale]/(client)/home/components/post/PostHeader";
// import PostStats from "@/app/[locale]/(client)/home/components/post/PostStats";
// import EditPostModal from "@/app/[locale]/(client)/home/components/post/EditPostModal";
// import ShareModal from "@/app/[locale]/(client)/home/components/post/ShareModal";

// import { Post } from "@/models/Post";
// import { reactionService } from "@/services/reactionService";
// import { shareService } from "@/services/shareService";
// import { moderationService } from "@/services/reportService";
// import { TargetType } from "@/models/Report";

// import { useAuthStore } from "@/store/authStore";
// import { useMyFriends } from "@/app/hooks/useMyFriends";

// import { getTimeAgo } from "@/utils/format";
// import { useTranslations } from "next-intl";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { useChat } from "@/app/providers/ChatProvider"; // 👈 THÊM

// import { chatService } from "@/services/chatService"; // 👈 dùng để get/create room

// type Props = {
//   post: Post;
//   onComment?: () => void;
//   isDetail?: boolean;
//   isSharePost?: boolean;
//   onDelete?: (postId: number, type: "POST" | "SHARE") => void;
// };

// export default function PostCard({
//   post,
//   onComment,
//   isDetail = false,
//   onDelete,
// }: Props) {
//   const router = useRouter();

//   const t = useTranslations("post");
//   const { user } = useAuthStore();
//   const { sendMessage } = useChat(); // 👈 lấy từ ChatProvider

//   const [editablePost, setEditablePost] = useState<Post>(post);
//   const [showEdit, setShowEdit] = useState(false);

//   const [reacted, setReacted] = useState(post.reacted ?? false);
//   const [likeCount, setLikeCount] = useState(post.reactionCount ?? 0);
//   const [shareCount, setShareCount] = useState(post.shareCount ?? 0);
//   const [isDeleted, setIsDeleted] = useState(false);
//   const [deleteCountdown, setDeleteCountdown] = useState(10);
//   const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);
//   const [pendingDelete, setPendingDelete] = useState(false);

//   const [showShareModal, setShowShareModal] = useState(false);

//   useEffect(() => {
//     setEditablePost(post);
//     setReacted(post.reacted ?? false);
//     setLikeCount(post.reactionCount ?? 0);
//     setShareCount(post.shareCount ?? 0);
//   }, [post]);

//   const handleToggleLike = async () => {
//     setReacted((prev) => !prev);
//     setLikeCount((prev) => (reacted ? prev - 1 : prev + 1));
//     await reactionService.toggleReaction({ postId: post.id });
//   };

//   const handleOpenShareModal = () => {
//     setShowShareModal(true);
//   };

//   const handleDeletePost = () => {
//     setIsDeleted(true);
//     setDeleteCountdown(10);
//     setPendingDelete(false);

//     const timer = setInterval(() => {
//       setDeleteCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           setPendingDelete(true);
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     setDeleteTimer(timer);
//   };

//   const handleUndoDelete = () => {
//     if (deleteTimer) clearInterval(deleteTimer);
//     setIsDeleted(false);
//     setPendingDelete(false);
//   };

//   useEffect(() => {
//     if (pendingDelete) {
//       onDelete?.(post.id, editablePost.sharedFrom ? "SHARE" : "POST");
//     }
//   }, [pendingDelete, onDelete, post.id, editablePost.sharedFrom]);

//   useEffect(() => {
//     return () => {
//       if (deleteTimer) clearInterval(deleteTimer);
//     };
//   }, [deleteTimer]);

//   if (isDeleted) {
//     return (
//       <div className="text-sm bg-gray-50 border rounded-xl p-4 flex justify-between items-center">
//         <span>
//           {t("undoDeleteMessage")} <b>{deleteCountdown}s</b>.
//         </span>
//         <Button
//           variant="link"
//           className="text-blue-600 underline px-2"
//           onClick={handleUndoDelete}
//         >
//           {t("undo")}
//         </Button>
//       </div>
//     );
//   }

//   const handleSubmitReport = async (reason: string) => {
//     await moderationService.createReport({
//       targetType: TargetType.POST,
//       targetId: post.id,
//       reason,
//     });
//   };

//   // Share lên News Feed (giữ nguyên)
//   const handleShareToFeed = async ({
//     message,
//     isPublic,
//   }: {
//     message: string;
//     isPublic: boolean;
//   }) => {
//     await shareService.create({
//       postId: editablePost.id,
//       message,
//       isPublic,
//     });
//     setShareCount((prev) => prev + 1);
//   };

//   // ✅ Share như tin nhắn, dùng ChatProvider
//   const handleSendAsMessage = async ({
//     message,
//     friendIds,
//   }: {
//     message: string;
//     friendIds: number[];
//   }) => {
//     if (!user) return;

//     const origin = typeof window !== "undefined" ? window.location.origin : "";
//     const postLink = `${origin}/post/${editablePost.id}/detail`;

//     const finalContent = message ? `${message}\n${postLink}` : postLink;

//     await Promise.all(
//       friendIds.map(async (friendId) => {
//         try {
//           // 1️⃣ Tìm room 1-1 đã tồn tại
//           const rooms = await chatService.getPrivateRooms(user.id);
//           const existing = (rooms as any[]).find((r) =>
//             r.members?.some((m: any) => m.id === friendId)
//           );

//           let roomId: string;

//           if (existing) {
//             roomId = existing.id;
//           } else {
//             // 2️⃣ Nếu chưa có, tạo room mới
//             const room = await chatService.createRoom(
//               "Chat cá nhân",
//               false,
//               [user.id as any, friendId as any] // đang chơi any nên không cần quá strict
//             );
//             roomId = room.id;
//           }

//           // 3️⃣ Gửi tin nhắn qua socket
//           sendMessage({
//             senderId: user.id,
//             roomId,
//             content: finalContent,
//           });
//         } catch (err) {
//           console.error("Send share as message failed:", err);
//         }
//       })
//     );
//   };

//   const handleGoToDetail = (postId: number) => {
//     router.push(`/post/${post.id}/detail`);
//   };

//   const original = editablePost.sharedFrom ?? null;

//   return (
//     <div
//       className={`text-sm bg-white rounded-xl space-y-2 ${
//         !isDetail ? "shadow" : ""
//       }`}
//     >
//       <PostHeader
//         t={t}
//         owner={editablePost.owner}
//         seconds={getTimeAgo(editablePost.createdAt)}
//         taggedUsers={editablePost.taggedUsers}
//         isOwner={editablePost.owner.id === user?.id}
//         isPublic={editablePost.visibility}
//         onDelete={handleDeletePost}
//         onEdit={() => setShowEdit(true)}
//         onReport={handleSubmitReport}
//         onGoDetail={() => handleGoToDetail(post.id)}
//       />

//       <PostContent
//         content={editablePost.contentText}
//         mediaAttachments={editablePost.mediaAttachments}
//       />

//       {original && (
//         <div className="mx-4 border rounded-xl overflow-hidden">
//           <div className="">
//             <PostHeader
//               t={t}
//               owner={original.owner}
//               seconds={getTimeAgo(original.createdAt)}
//               taggedUsers={original.taggedUsers}
//               isOwner={original.owner.id === user?.id}
//               isSharePost={false}
//               isPublic={original.visibility}
//               onDelete={undefined}
//               onEdit={undefined}
//               onReport={undefined}
//               isShareFromPost={true}
//               onGoDetail={() => handleGoToDetail(original.id)}
//             />
//           </div>

//           <div className="py-2">
//             <PostContent
//               content={original.contentText}
//               mediaAttachments={original.mediaAttachments}
//             />
//           </div>
//         </div>
//       )}

//       <PostStats
//         t={t}
//         likes={likeCount}
//         comments={editablePost.commentCount}
//         shares={shareCount}
//         onComment={onComment}
//       />
//       <PostActions
//         t={t}
//         onComment={onComment}
//         reacted={reacted}
//         onToggleLike={handleToggleLike}
//         onShare={handleOpenShareModal}
//         isSharePost={!!original}
//       />

//       {showEdit && (
//         <EditPostModal
//           t={t}
//           open={showEdit}
//           onClose={() => setShowEdit(false)}
//           post={editablePost}
//           onSaved={(updated) => {
//             setEditablePost((prev) => ({
//               ...prev,
//               contentText: updated.contentText,
//               taggedUsers: updated.taggedUsers,
//               mediaAttachments: updated.mediaAttachments,
//               mediaCount: updated.mediaAttachments?.length ?? 0,
//               reactionCount: updated.reactionCount ?? prev.reactionCount,
//               shareCount: updated.shareCount ?? prev.shareCount,
//               commentCount: updated.commentCount ?? prev.commentCount,
//               visibility: updated.visibility ?? prev.visibility,
//             }));
//           }}
//         />
//       )}

//       {showShareModal && (
//         <ShareModal
//           t={t}
//           open={showShareModal}
//           onClose={() => setShowShareModal(false)}
//           originalPostPreview={
//             <div className="overflow-hidden">
//               <div className="">
//                 <PostHeader
//                   t={t}
//                   owner={post.owner}
//                   seconds={getTimeAgo(post.createdAt)}
//                   taggedUsers={post.taggedUsers}
//                   isOwner={post.owner.id === user?.id}
//                   isSharePost={false}
//                   isPublic={post.visibility}
//                   onDelete={undefined}
//                   onEdit={undefined}
//                   onReport={undefined}
//                   isShareFromPost={true}
//                   onGoDetail={() => handleGoToDetail(post.id)}
//                 />
//               </div>

//               <div className="py-2">
//                 <PostContent
//                   content={post.contentText}
//                   mediaAttachments={post.mediaAttachments}
//                 />
//               </div>
//             </div>
//           }
//           onShareToFeed={handleShareToFeed}
//           onSendAsMessage={handleSendAsMessage} // 👈 dùng handler mới
//         />
//       )}
//     </div>
//   );
// }

"use client";

import PostActions from "@/app/[locale]/(client)/home/components/post/PostActions";
import PostContent from "@/app/[locale]/(client)/home/components/post/PostContent";
import PostHeader from "@/app/[locale]/(client)/home/components/post/PostHeader";
import PostStats from "@/app/[locale]/(client)/home/components/post/PostStats";
import EditPostModal from "@/app/[locale]/(client)/home/components/post/EditPostModal";

// ✅ dùng modal gộp (bạn đặt path đúng theo project)
import PostComposerModal from "@/app/[locale]/(client)/home/components/composer/PostComposerModal";

import { Post } from "@/models/Post";
import { reactionService } from "@/services/reactionService";
import { moderationService } from "@/services/reportService";
import { TargetType } from "@/models/Report";

import { useAuthStore } from "@/store/authStore";
import { getTimeAgo } from "@/utils/format";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useChat } from "@/app/providers/ChatProvider";
import { chatService } from "@/services/chatService";
import { postService } from "@/services/postService"; // ✅ share = createPost

type Props = {
  post: Post;
  onComment?: () => void;
  isDetail?: boolean;
  isSharePost?: boolean;
  onDelete?: (postId: number, type: "POST" | "SHARE") => void;
};

export default function PostCard({
  post,
  onComment,
  isDetail = false,
  onDelete,
}: Props) {
  const router = useRouter();
  const t = useTranslations("post");
  const { user } = useAuthStore();
  const { sendMessage } = useChat();

  const [editablePost, setEditablePost] = useState<Post>(post);
  const [showEdit, setShowEdit] = useState(false);

  const [reacted, setReacted] = useState(post.reacted ?? false);
  const [likeCount, setLikeCount] = useState(post.reactionCount ?? 0);
  const [shareCount, setShareCount] = useState(post.shareCount ?? 0);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  // ✅ thay showShareModal bằng showComposerShare
  const [showComposerShare, setShowComposerShare] = useState(false);

  useEffect(() => {
    setEditablePost(post);
    setReacted(post.reacted ?? false);
    setLikeCount(post.reactionCount ?? 0);
    setShareCount(post.shareCount ?? 0);
  }, [post]);

  const handleToggleLike = async () => {
    setReacted((prev) => !prev);
    setLikeCount((prev) => (reacted ? prev - 1 : prev + 1));
    await reactionService.toggleReaction({ postId: post.id });
  };

  const handleOpenShareModal = () => setShowComposerShare(true);

  const handleDeletePost = () => {
    setIsDeleted(true);
    setDeleteCountdown(10);
    setPendingDelete(false);

    const timer = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPendingDelete(true);
        }
        return prev - 1;
      });
    }, 1000);

    setDeleteTimer(timer);
  };

  const handleUndoDelete = () => {
    if (deleteTimer) clearInterval(deleteTimer);
    setIsDeleted(false);
    setPendingDelete(false);
  };

  useEffect(() => {
    if (pendingDelete) {
      onDelete?.(post.id, editablePost.sharedFrom ? "SHARE" : "POST");
    }
  }, [pendingDelete, onDelete, post.id, editablePost.sharedFrom]);

  useEffect(() => {
    return () => {
      if (deleteTimer) clearInterval(deleteTimer);
    };
  }, [deleteTimer]);

  if (isDeleted) {
    return (
      <div className="text-sm bg-gray-50 border rounded-xl p-4 flex justify-between items-center">
        <span>
          {t("undoDeleteMessage")} <b>{deleteCountdown}s</b>.
        </span>
        <Button
          variant="link"
          className="text-blue-600 underline px-2"
          onClick={handleUndoDelete}
        >
          {t("undo")}
        </Button>
      </div>
    );
  }

  const handleSubmitReport = async (reason: string) => {
    await moderationService.createReport({
      targetType: TargetType.POST,
      targetId: post.id,
      reason,
    });
  };

  // ✅ Share lên feed = createPost(originalPostId)
  const handleShareToFeedViaCreatePost = async ({
    message,
    isPublic,
  }: {
    message: string;
    isPublic: boolean;
  }) => {
    await postService.createPost({
      content: message, // caption share
      tagUserIds: [], // nếu muốn tag trong share thì truyền vào
      mediaFiles: [], // share không có media
      visibility: isPublic,
      originalPostId: editablePost.id, // quan trọng
    });

    setShareCount((prev) => prev + 1);
  };

  // ✅ Share như tin nhắn (tối ưu: get rooms 1 lần)
  const handleSendAsMessage = async ({
    message,
    friendIds,
  }: {
    message: string;
    friendIds: number[];
  }) => {
    if (!user) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const postLink = `${origin}/post/${editablePost.id}/detail`;

    await Promise.all(
      friendIds.map(async (friendId) => {
        try {
          const existing = rooms.find((r) =>
            r.members?.some((m: any) => m.id === friendId)
          );

          let roomId: string;

          if (existing) {
            roomId = existing.id;
          } else {
            const room = await chatService.createRoom("Chat cá nhân", false, [
              user.id as any,
              friendId as any,
            ]);
            roomId = room.id;
            rooms.push(room); // ✅ cache luôn để friend khác khỏi tạo trùng (nếu có)
          }

          sendMessage({
            senderId: user.id,
            roomId,
            content: message,
            sharedPost: {
              postId: post?.id,
              title: post?.contentText,
              image: post?.mediaAttachments?.[0]?.url,
              link: postLink,
              authorName: post?.owner?.fullName,
              authorAvatar: post?.owner?.avatarUrl,
            },
          });
        } catch (err) {
          console.error("Send share as message failed:", err);
        }
      })
    );
  };

  // ✅ FIX BUG: dùng đúng postId truyền vào
  const handleGoToDetail = (postId: number) => {
    router.push(`/post/${postId}/detail`);
  };

  const original = editablePost.sharedFrom ?? null;

  return (
    <div
      className={`text-sm bg-white rounded-xl space-y-2 ${
        !isDetail ? "shadow" : ""
      }`}
    >
      <PostHeader
        t={t}
        owner={editablePost.owner}
        seconds={getTimeAgo(editablePost.createdAt)}
        taggedUsers={editablePost.taggedUsers}
        isOwner={editablePost.owner.id === user?.id}
        isPublic={editablePost.visibility}
        onDelete={handleDeletePost}
        onEdit={() => setShowEdit(true)}
        onReport={handleSubmitReport}
        onGoDetail={() => handleGoToDetail(post.id)}
      />

      <PostContent
        content={editablePost.contentText}
        mediaAttachments={editablePost.mediaAttachments}
      />

      {original && (
        <div className="mx-4 border rounded-xl overflow-hidden">
          <PostHeader
            t={t}
            owner={original.owner}
            seconds={getTimeAgo(original.createdAt)}
            taggedUsers={original.taggedUsers}
            isOwner={original.owner.id === user?.id}
            isSharePost={false}
            isPublic={original.visibility}
            onDelete={undefined}
            onEdit={undefined}
            onReport={undefined}
            isShareFromPost={true}
            onGoDetail={() => handleGoToDetail(original.id)}
          />

          <div className="py-2">
            <PostContent
              content={original.contentText}
              mediaAttachments={original.mediaAttachments}
            />
          </div>
        </div>
      )}

      <PostStats
        t={t}
        likes={likeCount}
        comments={editablePost.commentCount}
        shares={shareCount}
        onComment={onComment}
      />

      <PostActions
        t={t}
        onComment={onComment}
        reacted={reacted}
        onToggleLike={handleToggleLike}
        onShare={handleOpenShareModal}
        isSharePost={!!original}
      />

      {showEdit && (
        <EditPostModal
          t={t}
          open={showEdit}
          onClose={() => setShowEdit(false)}
          post={editablePost}
          onSaved={(updated) => {
            setEditablePost((prev) => ({
              ...prev,
              contentText: updated.contentText,
              taggedUsers: updated.taggedUsers,
              mediaAttachments: updated.mediaAttachments,
              mediaCount: updated.mediaAttachments?.length ?? 0,
              reactionCount: updated.reactionCount ?? prev.reactionCount,
              shareCount: updated.shareCount ?? prev.shareCount,
              commentCount: updated.commentCount ?? prev.commentCount,
              visibility: updated.visibility ?? prev.visibility,
            }));
          }}
        />
      )}

      {/* ✅ Share modal mới = PostComposerModal ở chế độ share */}
      {showComposerShare && (
        <PostComposerModal
          t={t}
          showModal={showComposerShare}
          onClose={() => setShowComposerShare(false)}
          placeholder={
            t("share.saySomething") || "Nói gì đó về nội dung này..."
          }
          onPostCreated={() => {
            // bạn có thể refetch feed/wall ở đây nếu cần
          }}
          originalPostId={editablePost.id}
          originalPostPreview={
            <div className="overflow-hidden">
              <PostHeader
                t={t}
                owner={post.owner}
                seconds={getTimeAgo(post.createdAt)}
                taggedUsers={post.taggedUsers}
                isOwner={post.owner.id === user?.id}
                isSharePost={false}
                isPublic={post.visibility}
                onDelete={undefined}
                onEdit={undefined}
                onReport={undefined}
                isShareFromPost={true}
                onGoDetail={() => handleGoToDetail(post.id)}
              />
              <div className="py-2">
                <PostContent
                  content={post.contentText}
                  mediaAttachments={post.mediaAttachments}
                />
              </div>
            </div>
          }
          onSendAsMessage={handleSendAsMessage}
        />
      )}
    </div>
  );
}
