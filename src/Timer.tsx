import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Play, Pause, Minus, Settings2, RotateCcw } from "lucide-react";
import bunLogo from "./assets/Bun_JS_logo.png";

const PRESET_MINUTES = [5, 15, 25, 45];

export default function Timer() {
  const [totalMinutes, setTotalMinutes] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [opacity, setOpacity] = useState(1.0);
  const [scale, setScale] = useState(1.0);
  const [customMinutes, setCustomMinutes] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      try {
        new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczHjmP0NnWizYYKIHK2OC+WCgaYrLf5tFtQyMreLPX4c9oQSM2h9fi1XFBH0GI2+Xo7slhOx9Bj9/q6e7IYUAAAM=").play();
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    const applyScale = async () => {
      try { await invoke("resize_timer_window", { scale }); } catch (e) {}
    };
    applyScale();
  }, [scale]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? "0" : ""}${rs}`;
  };

  const setDuration = (minutes: number) => {
    setTotalMinutes(minutes);
    setSeconds(minutes * 60);
    setIsActive(false);
  };

  const handleCustomSubmit = () => {
    const m = parseInt(customMinutes);
    if (m > 0 && m <= 999) {
      setDuration(m);
      setCustomMinutes("");
    }
  };

  const hideTimer = async () => {
    try { await invoke("hide_timer_window"); } catch(e) {}
  };

  const startDrag = async () => {
    try { await invoke("drag_timer_window"); } catch (_) {}
  };

  return (
    <div
      onMouseDown={startDrag}
      className="h-screen w-screen relative flex flex-col items-center justify-center overflow-hidden cursor-move select-none transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(255,255,255,0.01)', opacity: opacity }}
    >
      {/* Settings Popover Panel */}
      {showSettings && (
        <div 
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute z-50 bg-black/75 backdrop-blur-xl p-4 rounded-2xl border border-white/20 w-48 text-white text-sm shadow-2xl"
          style={{ top: '10px', left: '10px' }}
        >
          <div className="mb-4">
            <label className="flex justify-between mb-2 opacity-80 text-xs">
              <span>⏱ Focus (min)</span>
              <span className="font-bold text-indigo-300">{totalMinutes}m</span>
            </label>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`py-1 rounded text-xs font-semibold transition-all ${totalMinutes === m ? "bg-indigo-500" : "bg-white/10 hover:bg-white/20"}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="number" min="1" max="999" placeholder="Custom"
                value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                className="flex-1 bg-white/10 rounded px-2 py-1 text-xs outline-none border border-transparent focus:border-indigo-400 placeholder-white/40"
              />
              <button onClick={handleCustomSubmit} className="px-2 py-1 bg-indigo-500 hover:bg-indigo-400 rounded text-xs font-semibold">Set</button>
            </div>
          </div>
          <div className="mb-3">
            <label className="flex justify-between mb-1 opacity-80 text-xs"><span>Size</span><span>{(scale*100).toFixed(0)}%</span></label>
            <input type="range" min="0.5" max="1.5" step="0.1" value={scale} onChange={(e)=>setScale(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
          </div>
          <div>
            <label className="flex justify-between mb-1 opacity-80 text-xs"><span>Opacity</span><span>{(opacity*100).toFixed(0)}%</span></label>
            <input type="range" min="0.1" max="1.0" step="0.1" value={opacity} onChange={(e)=>setOpacity(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>
        </div>
      )}

      {/* Fully Visible Bun Image - scaled and positioned top so it doesn't overlap controls */}
      <img
        src={bunLogo}
        alt="bun logo"
        className="absolute top-4 left-0 w-full h-[220px] object-contain pointer-events-none drop-shadow-xl"
      />

      {/* Floating control panel strictly situated at the bottom */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute bottom-4 z-20 flex flex-col items-center gap-1.5 bg-white/70 p-3 rounded-3xl backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all hover:bg-white/80"
      >
        <div 
          onClick={() => setShowSettings(!showSettings)} 
          className="text-4xl font-black text-slate-800 drop-shadow-sm tracking-tighter cursor-pointer hover:scale-105 transition-transform px-4" 
          title="Click to edit time"
        >
          {formatTime(seconds)}
        </div>
        
        <div className="flex gap-2 mt-1">
          <button onClick={() => setIsActive(!isActive)} className="p-2.5 bg-amber-400 hover:bg-amber-500 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-sm" title={isActive ? "Pause" : "Play"}>
            {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          <button onClick={() => { setSeconds(totalMinutes * 60); setIsActive(false); }} className="p-2.5 bg-slate-500 hover:bg-slate-600 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-sm" title="Reset">
            <RotateCcw size={18} />
          </button>
          
          <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-sm" title="Settings (Change Time/Scale)">
            <Settings2 size={18} />
          </button>

          <button onClick={hideTimer} className="p-2.5 bg-rose-500 hover:bg-rose-600 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-sm" title="Minimize to Tray">
            <Minus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}