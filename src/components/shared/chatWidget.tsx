// ChatWidget.tsx
"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "tinyllama", // ← or your preferred model
          messages: [...messages, userMessage],
          stream: false,
          options: { temperature: 0.7 },
        }),
      });

      if (!res.ok) throw new Error("Ollama request failed");

      const data = await res.json();
      const aiReply = data.message?.content || "(no response)";

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry — connection error. Is Ollama running?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button – with pulse when closed */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-8 right-8 z-50 w-14 h-14 
          rounded-full flex items-center justify-center text-white
          shadow-2xl transition-all duration-500 ease-out
          ${
            isOpen
              ? "bg-red-700 hover:bg-red-800 scale-95 rotate-180"
              : "bg-[#F42D43] hover:bg-[#e51f36] hover:scale-110 active:scale-90 animate-pulse-slow"
          }
        `}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg
            className="w-7 h-7 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window – bouncy entrance */}
      <div
        className={`
          fixed bottom-24 right-6 z-50 w-96 sm:w-[420px] h-[520px] 
          bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col
          transition-all duration-500 ease-out origin-bottom-right
          ${
            isOpen
              ? "scale-100 opacity-100 translate-y-0 animate-bounce-once"
              : "scale-90 opacity-0 translate-y-12 pointer-events-none"
          }
        `}
      >
        {/* Header */}
        <div className="bg-[#F42D43] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center animate-pulse-slow">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">AI Chat</h3>
              <p className="text-xs text-red-100 opacity-90">
                powered by Ollama
              </p>
            </div>
          </div>
        </div>

        {/* Messages – with slide-in animation */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/70 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 animate-fade-in">
              <svg
                className="w-12 h-12 mb-3 text-[#F42D43]/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm font-medium">Ask me anything!</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-in`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`
                  max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${
                    msg.role === "user"
                      ? "bg-[#F42D43] text-white rounded-br-md"
                      : "bg-white border border-slate-200 rounded-bl-md"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white shadow-sm rounded-2xl px-4 py-3 flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#F42D43] rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                <div className="w-2.5 h-2.5 bg-[#F42D43] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-[#F42D43] rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className={`
                flex-1 px-4 py-3 bg-slate-50 border border-slate-300 
                rounded-full text-sm focus:outline-none transition-all duration-300
                focus:border-[#F42D43] focus:ring-2 focus:ring-[#F42D43]/30 focus:bg-white
                disabled:opacity-60
              `}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`
                px-6 py-3 bg-[#F42D43] text-white rounded-full font-medium
                hover:bg-[#e51f36] active:scale-95 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!isLoading && input.trim() ? "animate-pulse-slow" : ""}
              `}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
