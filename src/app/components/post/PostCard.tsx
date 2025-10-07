import PostActions from "@/app/components/post/PostActions";
import PostContent from "@/app/components/post/PostContent";
import PostHeader from "@/app/components/post/PostHeader";
import PostStats from "@/app/components/post/PostStats";
import { useTranslations } from "next-intl";

export default function PostCard() {
  const t = useTranslations("post");

  const urls = [
    "https://picsum.photos/600/300?random=1",
    "https://picsum.photos/600/300?random=2",
    "https://picsum.photos/600/300?random=3",
    "https://picsum.photos/600/300?random=4",
    "https://picsum.photos/600/300?random=5",
    "https://picsum.photos/600/300?random=6",
    "https://picsum.photos/600/300?random=7",
    "https://picsum.photos/600/300?random=8",
    "https://picsum.photos/600/300?random=9",
    "https://picsum.photos/600/300?random=10",
  ];

  return (
    <div className="bg-white rounded-xl shadow space-y-2">
      <PostHeader
        t={t}
        name="Truong Le Duc Vi"
        seconds={12}
        avatarUrl="https://picsum.photos/600/300"
      />
      <PostContent content="test content" urls={urls} />
      <PostStats t={t} likes={123} comments={45} shares={12} />
      <PostActions t={t} />
    </div>
  );
}
