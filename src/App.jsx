import ChatComponent from "./chatcomponent";
import { useState, useRef, useEffect } from "react";
import Headers from "./Headers";
import { Send, Sparkles, Settings2, AlertCircle, Loader2, Key } from "lucide-react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = useRef(null);

  // Load API Key from LocalStorage on startup
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem("gemini_api_key") || "";
  });

  const [modelConfig, setModelConfig] = useState({
    model: "gemini-2.5-flash",
    maxTokens: 150,
    temperature: 0.7
  });

  const availableModels = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-lite"
  ];

  // Save API Key to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gemini_api_key", userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    // Check for user-provided key first
    if (!userApiKey) {
      setError("Please enter your Gemini API Key in Settings first.");
      setShowSettings(true);
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": userApiKey // Uses the state variable
          },
          body: JSON.stringify({
            contents: geminiHistory,
            systemInstruction: {
              parts: [{ text: "You are a scary, mean chatbot with a Nepali personality. Keep it short." }]
            },
            generationConfig: {
              maxOutputTokens: modelConfig.maxTokens,
              temperature: modelConfig.temperature
            }
          })
        }
      );

      if (!response.ok) throw new Error("Invalid API Key or API Error.");

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F9F8F6] text-slate-800 font-sans">
      <Headers 
        showSettings={showSettings} 
        setShowSettings={setShowSettings}
        currentModel={modelConfig.model}
      />

      {showSettings && (
        <div className="bg-white border-b border-slate-200 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            
            {/* API KEY SECTION */}
            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-2">
                <Key size={14} /> Gemini API Key
              </label>
              <input
                type="password"
                placeholder="Paste your API key here..."
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D1C4A3]"
              />
              <p className="text-[10px] text-slate-400 italic">Key is stored locally in your browser.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold uppercase">Engine</label>
                <select
                  value={modelConfig.model}
                  onChange={(e) => setModelConfig({ ...modelConfig, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D1C4A3]"
                >
                  {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold flex justify-between uppercase">
                  Tokens <span>{modelConfig.maxTokens}</span>
                </label>
                <input type="range" min="50" max="500" value={modelConfig.maxTokens}
                  onChange={(e) => setModelConfig({ ...modelConfig, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-[#7D7461]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold flex justify-between uppercase">
                  Temp <span>{modelConfig.temperature}</span>
                </label>
                <input type="range" min="0" max="1" step="0.1" value={modelConfig.temperature}
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

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center mt-32 text-center space-y-6">
              <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100">
                <Sparkles className="w-8 h-8 text-[#7D7461]" />
              </div>
              <div>
                <h2 className="text-3xl font-serif text-slate-900 tracking-tight">System Ready.</h2>
                {!userApiKey && (
                  <p className="text-red-500 mt-2 text-sm font-medium animate-pulse">
                    ⚠ API Key Required in Settings
                  </p>
                )}
              </div>
            </div>
          ) : (
            <ChatComponent messages={messages} />
          )}

          {isLoading && (
            <div className="flex items-center gap-2 mt-8 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs italic tracking-wide">Analysing...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="p-6">
        <div className="max-w-2xl mx-auto relative group">
          <div className="relative flex items-end gap-2 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-xl shadow-slate-200/50">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-3 resize-none max-h-40 text-base"
              rows={1}
              value={message}
              placeholder={userApiKey ? "Speak..." : "Set API Key above first..."}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !userApiKey}
            />
            <button
              className="bg-[#7D7461] hover:bg-[#5E5748] disabled:bg-slate-200 text-white p-2 mb-1 rounded-xl transition-all"
              onClick={sendMessage}
              disabled={isLoading || !message.trim() || !userApiKey}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;