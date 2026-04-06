import { Trash2, Flame, Zap, Coffee } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
}

const weightConfig = {
  low: { border: 'border-emerald-400/30', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: Coffee },
  medium: { border: 'border-amber-400/30', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Zap },
  high: { border: 'border-rose-400/30', color: 'text-rose-400', bg: 'bg-rose-400/10', icon: Flame },
};

export default function TaskList({ tasks, onDelete }: TaskListProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 glass-card rounded-2xl p-6 relative overflow-hidden group">
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/50 via-indigo-400/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

      <h2 className="text-base font-semibold mb-4 text-white/90 tracking-wide shrink-0">Task Pool</h2>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40 text-sm border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
            <p>Pool is empty.</p>
            <p className="opacity-70">Add tasks above.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const config = weightConfig[task.weight];
            const Icon = config.icon;
            
            return (
              <div 
                key={task.id}
                className="group/item flex items-center justify-between p-3.5 bg-black/20 border border-white/10 rounded-xl hover:bg-black/40 hover:border-indigo-400/50 hover:shadow-[0_4px_20px_rgba(99,102,241,0.15)] transition-all duration-300 ease-out backdrop-blur-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={cn("p-2 rounded-lg shrink-0", "bg-black/30 shadow-inner border", config.border, config.color)}>
                    <Icon className="w-4 h-4 drop-shadow-[0_0_8px_currentColor]" />
                  </div>
                  <span className="text-white/90 font-medium text-base truncate">{task.name}</span>
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-white/30 hover:text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all hover:bg-rose-400/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
