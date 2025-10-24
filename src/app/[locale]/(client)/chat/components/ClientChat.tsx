"use client";

import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/services/chatService";
import ChatBox from "./ChatBox";
import { uploadFilesAsAttachments } from "@/services/uploadService";

export default function ClientChat({
  conversationId,
  initialMessages,
  selfUserId,
  user,
}: {
  conversationId: number;
  initialMessages: ChatMessage[];
  selfUserId: number;
  user: { id: number; role?: string; email?: string };
}) {
  const { messages, sendText, sendWithFiles, editMessage, deleteMessage } =
    useChat({
      conversationId,
      xUser: user,
      initialMessages,
      uploadFiles: uploadFilesAsAttachments,
    });

  return (
    <ChatBox
      selfUserId={selfUserId}
      messages={messages}
      onSendText={sendText}
      onSendFiles={(files, caption) => sendWithFiles(files, caption)}
      onEditMessage={(id, content) => editMessage(id, content)}
      onDeleteMessage={(id) => deleteMessage(id)}
    />
  );
}
