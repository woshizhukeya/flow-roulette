import React, { useState } from 'react';
import { Plus, Flame, Zap, Coffee } from 'lucide-react';
import { Task, Weight } from '../types';
import { cn } from '../lib/utils';

interface TaskInputProps {
  onAdd: (task: Task) => void;
}

const weightConfig = {
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', icon: Coffee },
  medium: { label: 'Med', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', icon: Zap },
  high: { label: 'High', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30', icon: Flame },
};

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<Weight>('medium');

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: inputValue.trim(),
      weight: selectedWeight,
    });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col shrink-0 relative group">
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/50 via-indigo-400/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <h2 className="text-base font-semibold mb-4 text-white/90 tracking-wide flex items-center gap-2 text-glow"><Zap className="w-4 h-4 text-indigo-400" /> New Task</h2>
      
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="w-full bg-white/10 text-white placeholder:text-white/50 outline-none text-base font-semibold border-2 border-indigo-500/50 focus:border-indigo-400 focus:bg-white/20 rounded-xl px-4 py-3 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all"
        />
        
        <div className="flex gap-2">
          {(Object.keys(weightConfig) as Weight[]).map((w) => {
            const Icon = weightConfig[w].icon;
            const isSelected = selectedWeight === w;
            return (
              <button
                key={w}
                onClick={() => setSelectedWeight(w)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300",
                  isSelected 
                    ? `bg-black/30 ${weightConfig[w].border} ${weightConfig[w].color} shadow-inner` 
                    : "border-transparent hover:bg-white/10 text-white/40 hover:text-white/80"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase">{weightConfig[w].label}</span>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/80 to-violet-500/80 hover:from-indigo-400 hover:to-violet-400 disabled:from-white/5 disabled:to-white/10 disabled:text-white/25 text-white font-semibold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/40 disabled:border-white/10 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>{inputValue.trim() ? 'Add Task' : 'Type to add...'}</span>
        </button>
      </div>
    </div>
  );
}
