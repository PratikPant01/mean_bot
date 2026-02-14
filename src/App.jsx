import ChatComponent from "./chatcomponent";
import { useState, useRef, useEffect } from "react";
import Headers from "./headers";
import { Send, Sparkles, Settings2, AlertCircle, Loader2 } from "lucide-react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = useRef(null);

  const [modelConfig, setModelConfig] = useState({
    model: "gemini-2.5-flash",
    maxTokens: 150,
    temperature: 0.7
  });

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const availableModels = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-lite"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    if (!API_KEY) {
      setError("API key is not configured.");
      return;
    }

    const currentMessage = message.trim();
    const updatedMessages = [...messages, { role: "user", content: currentMessage }];
    
    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const geminiHistory = updatedMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const systemInstruction = {
        parts: [{
          text: `You are a chatbot with a scary and intimidating Nepali-style personality. 
          Speak in English only. Keep responses short and mean.`
        }]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY
          },
          body: JSON.stringify({
            contents: geminiHistory,
            systemInstruction: systemInstruction,
            generationConfig: {
              maxOutputTokens: modelConfig.maxTokens,
              temperature: modelConfig.temperature
            }
          })
        }
      );

      if (!response.ok) throw new Error("Connection failed.");

      const data = await response.json();
      const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";

      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F9F8F6] text-slate-800 font-sans selection:bg-[#DBCFB0]">
      <Headers 
        showSettings={showSettings} 
        setShowSettings={setShowSettings}
        currentModel={modelConfig.model}
      />

      {/* Settings - Claude-style soft panel */}
      {showSettings && (
        <div className="bg-white border-b border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <Settings2 size={16} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Model Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold uppercase">Engine</label>
                <select
                  value={modelConfig.model}
                  onChange={(e) => setModelConfig({ ...modelConfig, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D1C4A3] transition-all"
                >
                  {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold flex justify-between uppercase">
                  Tokens <span>{modelConfig.maxTokens}</span>
                </label>
                <input
                  type="range" min="50" max="500" value={modelConfig.maxTokens}
                  onChange={(e) => setModelConfig({ ...modelConfig, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-[#7D7461]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold flex justify-between uppercase">
                  Temp <span>{modelConfig.temperature}</span>
                </label>
                <input
                  type="range" min="0" max="1" step="0.1" value={modelConfig.temperature}
                  onChange={(e) => setModelConfig({ ...modelConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-[#7D7461]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 flex items-center justify-center gap-2 text-sm border-b border-red-100 italic">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center mt-32 text-center space-y-6">
              <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100">
                <Sparkles className="w-8 h-8 text-[#7D7461]" />
              </div>
              <div>
                <h2 className="text-3xl font-serif text-slate-900 tracking-tight">How can I help you?</h2>
                <p className="text-slate-500 mt-2 text-lg italic">The Enforcer is listening...</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center pt-4">
                {["Hey", "Why so mean?", "Tell me a secret"].map((tip) => (
                  <button 
                    key={tip}
                    onClick={() => setMessage(tip)} 
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 transition-all shadow-sm"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ChatComponent messages={messages} />
          )}

          {isLoading && (
            <div className="flex items-center gap-2 mt-8 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs italic tracking-wide">Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area - Claude-style floating island */}
      <footer className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-end gap-2 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-xl shadow-slate-200/50 transition-all focus-within:border-[#D1C4A3]">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-3 resize-none max-h-40 text-base placeholder-slate-400 font-sans"
              rows={1}
              value={message}
              placeholder="Write your message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              style={{ minHeight: "24px" }}
            />
            <button
              className="bg-[#7D7461] hover:bg-[#5E5748] disabled:bg-slate-200 text-white p-2 mb-1 rounded-xl transition-all shadow-md"
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
            >
              <Send className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-6 tracking-wide">
            Its Scary Chatbot, not your friend. Don't expect kindness. Ask it anything... if you dare.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;