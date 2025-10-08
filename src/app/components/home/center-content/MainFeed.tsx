"use client";
import PostComposer from "@/app/components/home/center-content/PostComposer";
import PostCard from "@/app/components/home/post/PostCard";
import Stories from "@/app/components/home/Stories";
import { Post } from "@/models/Post";
import { postService } from "@/services/postService";
import React, { useEffect, useState } from "react";

export default function MainFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await postService.getNewfeed();
        console.log(data);

        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-2 max-w-[500px] space-y-6">
      {/* Stories */}
      <Stories />
      {/* Ô tạo bài */}
      <PostComposer />

      {/* Bài viết */}
      {posts !== null && posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500 text-center">No posts yet.</p>
      )}
    </div>
  );
}
