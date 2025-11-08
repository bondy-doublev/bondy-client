"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  tab: "personal" | "group";
  setTab: (t: "personal" | "group") => void;
  conversations: any[];
  selectedRoomId: string | null;
  onSelectRoom: (room: any) => void;
  onOpenDialog: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tab,
  setTab,
  conversations,
  selectedRoomId,
  onSelectRoom,
  onOpenDialog,
}) => {
  return (
    <div className="w-80 border-r border-gray-200 p-4 flex flex-col">
      <Tabs value={tab} onValue={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="personal">Cá nhân</TabsTrigger>
          <TabsTrigger value="group">Nhóm</TabsTrigger>
        </TabsList>
      </Tabs>

      <Button className="mb-2" onClick={onOpenDialog}>
        {tab === "personal" ? "New Chat" : "New Group"}
      </Button>

      <ScrollArea className="flex-1">
        <ul className="space-y-2">
          {conversations.map((r) => (
            <li key={r.id}>
              <button
                className={
                  "w-full text-left px-2 py-1 rounded " +
                  (selectedRoomId === r.id ? "bg-gray-200" : "")
                }
                onClick={() => onSelectRoom(r)}
              >
                {tab === "personal" ? r.displayName : r.name}
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};
