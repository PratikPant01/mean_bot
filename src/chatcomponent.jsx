import React from "react";
import { User, Bot } from "lucide-react";

function ChatComponent({ messages }) {
  return (
    <div className="flex flex-col gap-6 py-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex gap-4 items-start ${
            msg.role === "assistant" ? "flex-row" : "flex-row-reverse"
          }`}
        >
          {/* Avatar - Minimalist circular style */}
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
              msg.role === "assistant"
                ? "bg-white border-slate-200 shadow-sm"
                : "bg-[#7D7461] border-[#7D7461]"
            }`}
          >
            {msg.role === "assistant" ? (
              <Bot className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
            ) : (
              <User className="w-5 h-5 text-white" strokeWidth={1.5} />
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={`px-5 py-3 rounded-2xl max-w-[85%] shadow-sm transition-all ${
              msg.role === "assistant"
                ? "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                : "bg-[#7D7461]/5 border border-[#7D7461]/10 text-slate-800 rounded-tr-none"
            }`}
          >
            {/* Role Label - Subtle touches like Claude */}
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50 ${
                msg.role === "assistant" ? "text-slate-500" : "text-[#7D7461] text-right"
            }`}>
              {msg.role === "assistant" ? "The Enforcer" : "You"}
            </p>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-sans">
              {msg.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatComponent;