"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { Message, chatService } from "@/services/chatService";

interface ChatAreaProps {
  messages: Message[];
  newMsg: string;
  setNewMsg: (msg: string) => void;
  onSend: () => void;
  messageEndRef: React.RefObject<HTMLDivElement>;
  onEditMessage: (msg: Message, newContent: string) => void;
  onDeleteMessage: (msg: Message) => void;
  onReplyMessage: (msg: Message) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  newMsg,
  setNewMsg,
  onSend,
  messageEndRef,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
}) => {
  return (
    <div className="flex-1 flex flex-col relative">
      <ScrollArea className="flex-1 p-4 space-y-2">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            msg={msg}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            onReply={onReplyMessage}
          />
        ))}
        <div ref={messageEndRef} />
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 flex space-x-2">
        <Input
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
        />
        <Button onClick={onSend}>Send</Button>
      </div>
    </div>
  );
};
