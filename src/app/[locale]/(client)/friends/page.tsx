"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import FriendSuggestion from "./components/FriendSuggestion";
import FriendRequests from "./components/FriendRequest";
import MyFriends from "./components/MyFriend";
import PendingSentRequests from "./components/PendingSendRequest";

type Tab = "all" | "requests" | "me" | "sent";

export default function FriendPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const renderTab = () => {
    if (activeTab === "all") return <FriendSuggestion />;
    if (activeTab === "requests") return <FriendRequests />;
    if (activeTab === "me") return <MyFriends />;
    if (activeTab === "sent") return <PendingSentRequests />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-4">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          className={
            activeTab === "all"
              ? "bg-green-600 text-white"
              : "text-green-700 border-green-700"
          }
          onClick={() => setActiveTab("all")}
        >
          Tất cả người dùng
        </Button>
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          className={
            activeTab === "requests"
              ? "bg-green-600 text-white"
              : "text-green-700 border-green-700"
          }
          onClick={() => setActiveTab("requests")}
        >
          Lời mời kết bạn
        </Button>
        <Button
          variant={activeTab === "me" ? "default" : "outline"}
          className={
            activeTab === "me"
              ? "bg-green-600 text-white"
              : "text-green-700 border-green-700"
          }
          onClick={() => setActiveTab("me")}
        >
          Bạn bè của bạn
        </Button>
        <Button
          variant={activeTab === "sent" ? "default" : "outline"}
          className={
            activeTab === "sent"
              ? "bg-green-600 text-white"
              : "text-green-700 border-green-700"
          }
          onClick={() => setActiveTab("sent")}
        >
          Đang chờ phản hồi
        </Button>
      </div>

      {/* Nội dung tab */}
      <div>{renderTab()}</div>
    </div>
  );
}
