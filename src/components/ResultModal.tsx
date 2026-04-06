import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Task } from '../types';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onStartFocus: () => void; // 这里的定义是对的
}

// 注意这里：增加了 onStartFocus 的解构赋值
export default function ResultModal({ isOpen, onClose, task, onStartFocus }: ResultModalProps) {
  useEffect(() => {
    if (isOpen && task) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, task]);

  // 修改这里：点击时调用传入的跳转函数
  const handleInternalStartFocus = () => {
    onStartFocus(); 
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="glass-card p-10 rounded-[2.5rem] max-w-md w-full text-center pointer-events-auto relative overflow-hidden"
            >
              <div className="relative z-10">
                <h2 className="text-xl font-semibold text-white/60 mb-2 tracking-[0.2em] uppercase">Fate has chosen</h2>
                <div className="text-4xl md:text-5xl font-bold text-white mb-10 py-2 text-glow">
                  {task.name}
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleInternalStartFocus}
                    className="w-full py-4 bg-indigo-500/80 hover:bg-indigo-400 text-white font-bold rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50"
                  >
                    开始专注 (Start Focus)
                  </button>
                  <button onClick={onClose} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl border border-white/20 transition-all active:scale-95">
                    再抽一次 (Spin Again)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}