import React, { useState, useRef } from 'react';
import { Plus, Download, Upload, Trash2, Folder, Clock, PencilLine } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";
import { Group } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  groups: Group[];
  activeGroupId: string;
  onSelectGroup: (id: string) => void;
  onAddGroup: (name: string) => void;
  onEditGroup: (id: string, newName: string) => void;
  onDeleteGroup: (id: string) => void;
  onExportGroup: (group: Group) => void;
  onImportGroup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Sidebar({
  groups,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onExportGroup,
  onImportGroup,
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName('');
      setIsAdding(false);
    }
  };

  const submitEdit = (id: string) => {
    if (editGroupName.trim()) {
      onEditGroup(id, editGroupName.trim());
    }
    setEditingGroupId(null);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest">Presets</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="New Group"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="px-2 py-2 mb-2">
            <input
              autoFocus
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onBlur={() => {
                if (newGroupName.trim()) {
                  onAddGroup(newGroupName.trim());
                  setNewGroupName('');
                }
                setIsAdding(false);
              }}
              placeholder="Group name..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-indigo-400/50 focus:bg-black/40 transition-all shadow-inner"
            />
          </form>
        )}

        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={cn(
              "group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300",
              activeGroupId === group.id
                ? "bg-white/10 text-white shadow-lg border border-white/20 backdrop-blur-md"
                : "text-white/60 hover:bg-white/5 hover:text-white/95 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
              <Folder className={cn("w-4 h-4 shrink-0", activeGroupId === group.id ? "text-indigo-400" : "")} />
              
              {editingGroupId === group.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  onBlur={() => submitEdit(group.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitEdit(group.id);
                  }}
                  className="w-full bg-black/40 border border-indigo-400/50 rounded px-2 py-1 text-sm text-white outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate text-sm font-medium tracking-wide">{group.name}</span>
              )}
            </div>
            
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditGroupName(group.name);
                  setEditingGroupId(group.id);
                }}
                className="p-1.5 text-white/30 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                title="Rename Group"
              >
                <PencilLine className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExportGroup(group);
                }}
                className="p-1.5 text-white/30 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                title="Export Configuration"
              >
                <Download className="w-4 h-4" />
              </button>
              {groups.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group.id);
                  }}
                  className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                  title="Delete Group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 shrink-0 flex flex-col gap-2">
        <button
          onClick={async () => {
            try {
              await invoke("start_focus_window");
            } catch(e) { console.error(e); }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-100 bg-indigo-500/80 hover:bg-indigo-400 rounded-2xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Clock className="w-4 h-4" />
          Show Timer
        </button>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={onImportGroup}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white/60 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 hover:border-white/10 hover:text-white"
        >
          <Upload className="w-4 h-4" />
          Import Config
        </button>
      </div>
    </div>
  );
}
