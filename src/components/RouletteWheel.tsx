import { useState, useRef } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { Task, WEIGHT_VALUES } from '../types';
import { cn } from '../lib/utils';

interface RouletteWheelProps {
  tasks: Task[];
  onSpinStart: () => void;
  onSpinEnd: (task: Task) => void;
}

const COLORS = [
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#22c55e', // green
];

export default function RouletteWheel({ tasks, onSpinStart, onSpinEnd }: RouletteWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimationControls();
  const currentRotation = useRef(0);

  const sectionAngle = tasks.length > 0 ? 360 / tasks.length : 360;

  const handleSpin = async () => {
    if (tasks.length === 0 || isSpinning) return;

    setIsSpinning(true);
    onSpinStart();

    // 1. Pick a winner based on weights
    const totalWeight = tasks.reduce((sum, t) => sum + WEIGHT_VALUES[t.weight], 0);
    const randomVal = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    let selectedIndex = 0;
    for (let i = 0; i < tasks.length; i++) {
      cumulativeWeight += WEIGHT_VALUES[tasks[i].weight];
      if (randomVal <= cumulativeWeight) {
        selectedIndex = i;
        break;
      }
    }

    // 2. Calculate target rotation
    // Conic gradient: segment i occupies [i*sectionAngle, (i+1)*sectionAngle] starting from 12 o'clock going clockwise
    // Pointer is at 12 o'clock (top)
    // For the pointer to land in the MIDDLE of selected segment, we need to rotate the wheel
    // so that the center of segment[selectedIndex] aligns with the top
    // Center of segment i = i * sectionAngle + sectionAngle / 2
    // We rotate clockwise by (360 - centerOfSelected) plus full extra spins
    const centerOfSelected = selectedIndex * sectionAngle + sectionAngle / 2;
    const extraSpins = 5 * 360; // 5 full dramatic spins
    const targetRotation = currentRotation.current + extraSpins + (360 - centerOfSelected - (currentRotation.current % 360) + 360) % 360;
    
    await controls.start({
      rotate: targetRotation,
      transition: { duration: 4.5, ease: [0.2, 0, 0, 1] }
    });

    currentRotation.current = targetRotation % 360;
    setIsSpinning(false);
    onSpinEnd(tasks[selectedIndex]);
  };

  // Build conic gradient segments
  const conicGradient = tasks.length > 0 
    ? `conic-gradient(${tasks.map((_, i) => {
        const color = COLORS[i % COLORS.length];
        return `${color} ${i * sectionAngle}deg ${(i + 1) * sectionAngle}deg`;
      }).join(', ')})`
    : 'conic-gradient(#334155 0deg, #1e293b 360deg)';

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Decorative outer glow ring */}
      <div className="absolute w-[calc(100%+24px)] h-[calc(100%+24px)] rounded-full bg-gradient-to-br from-indigo-500/30 via-transparent to-rose-500/30 blur-lg" />
      
      <motion.div
        animate={controls}
        className="w-full h-full rounded-full shadow-[0_0_30px_rgba(99,102,241,0.25)] relative overflow-hidden border-[6px] border-white/25"
        style={{ rotate: currentRotation.current }}
      >
        {/* Conic gradient background */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ backgroundImage: conicGradient }}
        />

        {/* Inner ring shadow overlay */}
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.25)' }} />

        {/* Separator lines */}
        {tasks.map((_, i) => (
          <div
            key={`sep-${i}`}
            className="absolute top-0 left-1/2 w-[2px] h-1/2 origin-bottom bg-white/30"
            style={{ transform: `rotate(${i * sectionAngle}deg)` }}
          />
        ))}
        
        {/* Texts placed radially */}
        {tasks.map((task, i) => {
          const midAngle = i * sectionAngle + sectionAngle / 2;
          // Convert to radians, offset by -90 because CSS 0deg is 3 o'clock
          const rad = ((midAngle - 90) * Math.PI) / 180;
          const radius = 38; // % from center
          const x = 50 + radius * Math.cos(rad);
          const y = 50 + radius * Math.sin(rad);
          return (
            <div
              key={task.id}
              className="absolute pointer-events-none text-white font-bold text-sm md:text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-center leading-tight"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                maxWidth: `${Math.min(sectionAngle * 2, 100)}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {task.name}
            </div>
          );
        })}
      </motion.div>
      
      {/* Center button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={cn(
          "absolute z-20 w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border-4 border-white/30 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all active:scale-90 flex items-center justify-center text-center px-2 hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]",
          isSpinning && "opacity-50 cursor-not-allowed border-transparent animate-pulse"
        )}
      >
        {isSpinning ? "选择中..." : "别废话\n帮我选"}
      </button>

      {/* Pointer at top */}
      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 z-30">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-indigo-500 drop-shadow-[0_4px_8px_rgba(99,102,241,0.6)]" />
      </div>
    </div>
  );
}