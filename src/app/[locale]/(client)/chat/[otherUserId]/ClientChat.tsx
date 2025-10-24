"use client";

import { useChat } from "@/hooks/useChat";
import { ChatMessage, Attachment } from "@/services/chatService";
import { uploadService } from "@/services/uploadService";
import ChatBox from "../components/ChatBox";

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
  // Adapter: dùng uploadService để tạo Attachment[]
  const uploadFiles = async (files: File[]): Promise<Attachment[]> => {
    const urls = await uploadService.uploadMultipleFile(files);
    // Map theo index: gắn thêm metadata từ File
    return urls.map((url, i) => {
      const f = files[i];
      return {
        url,
        fileName: f?.name,
        mimeType: f?.type,
        size: f?.size,
      };
    });
  };

  const { messages, sendText, sendWithFiles, editMessage, deleteMessage } =
    useChat({
      conversationId,
      xUser: user, // gửi X-User-* vào STOMP CONNECT headers
      initialMessages,
      uploadFiles, // <— dùng uploadService qua adapter này
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
