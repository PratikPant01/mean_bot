import React from "react";
import { Bot, Settings, ChevronDown } from "lucide-react";

const Headers = ({ showSettings, setShowSettings, currentModel }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-lg">
            <Bot className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-slate-900 text-sm font-bold tracking-tight leading-none">
              Enforcer AI
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
              Nepali Personality v2.0
            </p>
          </div>
        </div>

        {/* Right: Model Info & Settings Toggle */}
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[11px] font-mono text-slate-500">{currentModel}</span>
            </div>
            
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-all ${
                    showSettings 
                    ? "bg-[#7D7461] text-white shadow-inner" 
                    : "hover:bg-slate-100 text-slate-500"
                }`}
            >
                <Settings className={`w-5 h-5 ${showSettings ? 'animate-spin-slow' : ''}`} strokeWidth={2} />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Headers;