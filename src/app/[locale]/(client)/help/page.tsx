"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Sparkles, User } from "lucide-react";
import { chatbotService } from "@/services/chatbotService";
import { FaqResponse, faqService } from "@/services/faqService";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
};

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faqs, setFaqs] = useState<FaqResponse[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFaqs();
    addBotMessage(
      "Xin chào! Tôi là trợ lý ảo của Bondy. Tôi có thể giúp gì cho bạn?"
    );
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadFaqs = async () => {
    const data = await faqService.getAll();
    setFaqs(data);
  };

  const addBotMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "bot",
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: question,
        timestamp: new Date(),
      },
    ]);

    const response = await chatbotService.chat(question);
    setIsLoading(false);

    addBotMessage(
      response ||
        "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau."
    );
  };

  const handleFaqClick = async (question: string) => {
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: question,
        timestamp: new Date(),
      },
    ]);

    const response = await chatbotService.chat(question);
    setIsLoading(false);

    addBotMessage(
      response ||
        "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau."
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto h-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* FAQ */}
          <div className="hidden sm:block lg:col-span-4 h-full overflow-auto">
            <div className="bg-white rounded-2xl shadow border p-6 h-full overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-semibold">Câu hỏi thường gặp</h2>
              </div>

              <div className="space-y-2">
                {faqs.slice(0, 8).map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleFaqClick(faq.question)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-emerald-500 hover:text-white transition-all text-sm shadow-sm hover:shadow-md"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CHAT */}
          <div className="lg:col-span-8 h-full overflow-auto">
            <div className="bg-white rounded-2xl shadow border h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="shrink-0 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                    <Bot className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-white">
                      Trợ lý ảo Bondy
                    </h1>
                    <p className="text-xs text-white/80">
                      Trực tuyến • Phản hồi nhanh
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white border rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 items-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang trả lời...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 border-t p-4 bg-white">
                <div className="flex gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow transition"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
