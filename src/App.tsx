import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import { Task, Group } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import RouletteWheel from './components/RouletteWheel';
import ResultModal from './components/ResultModal';
import Sidebar from './components/Sidebar';
import bgImage from './assets/bg.jpg';

export default function App() {
  // --- 1. 状态初始化与持久化 ---
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('flow-roulette-groups');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [{ id: 'default', name: 'My Tasks', tasks: [] }];
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    return localStorage.getItem('flow-roulette-active-group') || 'default';
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setIsSpinning] = useState(false);

  useEffect(() => {
    localStorage.setItem('flow-roulette-groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('flow-roulette-active-group', activeGroupId);
  }, [activeGroupId]);

  const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0];

  // --- 2. 核心业务指令 ---

  // 调用 Rust 指令：切换至专注窗口
  const handleStartFocus = async () => {
    try {
      console.log("CTO 指令：正在拉起专注悬浮球...");
      await invoke("start_focus_window");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Rust 窗口调度失败:", err);
    }
  };

  // --- 3. 分组管理逻辑 (Sidebar 调用) ---
  const handleAddGroup = (name: string) => {
    const newGroup: Group = { id: crypto.randomUUID(), name, tasks: [] };
    setGroups(prev => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
  };

  const handleDeleteGroup = (id: string) => {
    if (groups.length <= 1) return; // 至少保留一个分组
    setGroups(prev => {
      const newGroups = prev.filter(g => g.id !== id);
      if (activeGroupId === id) setActiveGroupId(newGroups[0].id);
      return newGroups;
    });
  };

  const handleEditGroup = (id: string, newName: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name: newName } : g));
  };

  const handleExportGroup = (group: Group) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(group, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${group.name}_config.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportGroup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.name && Array.isArray(imported.tasks)) {
          imported.id = crypto.randomUUID();
          setGroups(prev => [...prev, imported]);
          setActiveGroupId(imported.id);
        }
      } catch (err) { alert("配置文件格式不正确"); }
    };
    reader.readAsText(file);
    e.target.value = ''; // 重置 input
  };

  // --- 4. 任务管理逻辑 ---
  const handleAddTask = (task: Task) => {
    setGroups(prev => prev.map(g => 
      g.id === activeGroupId ? { ...g, tasks: [...g.tasks, task] } : g
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === activeGroupId ? { ...g, tasks: g.tasks.filter(t => t.id !== taskId) } : g
    ));
  };

  // --- 5. 轮盘逻辑 ---
  const handleSpinEnd = (task: Task) => {
    setIsSpinning(false);
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div 
        className="flex h-screen w-screen text-slate-800 font-sans overflow-hidden relative bg-[#0f172a] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
    >
      
      {/* 轻微氛围叠加层 - 只给背景加一点暗色，不影响前景 */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none z-0" />

      {/* 侧边栏：分组管理 (固宽) */}
      <div className="flex flex-col w-64 shrink-0 border-r border-white/20 glass-panel z-30 shadow-[4px_0_40px_rgba(0,0,0,0.1)]">
        <Sidebar 
          groups={groups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroupId}
          onAddGroup={handleAddGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onExportGroup={handleExportGroup}
          onImportGroup={handleImportGroup}
        />
      </div>

      {/* 中间栏：任务录入与列表 (400px) */}
      <div className="flex flex-col w-80 shrink-0 border-r border-white/20 p-6 gap-6 glass-panel z-20 overflow-y-auto">
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-[0.2em] ml-1">Focus Target</h2>
          <TaskInput onAdd={handleAddTask} />
        </div>
        <div className="flex-1 overflow-y-auto mt-2 pr-1">
           <TaskList tasks={activeGroup.tasks} onDelete={handleDeleteTask} />
        </div>
      </div>

      {/* 右侧：轮盘展示区 - overflow-hidden 防止轮盘溢出遮盖左侧面板 */}
      <div className="flex-1 relative flex items-center justify-center p-8 z-10 overflow-hidden">
        <div className="w-full max-w-[500px] aspect-square relative">
            <RouletteWheel 
                tasks={activeGroup.tasks} 
                onSpinStart={() => setIsSpinning(true)}
                onSpinEnd={handleSpinEnd} 
            />
        </div>
      </div>

      {/* 结果弹窗 (带五彩纸屑) */}
      <ResultModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={selectedTask}
        onStartFocus={handleStartFocus}
      />
    </div>
  );
}