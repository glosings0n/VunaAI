import React from 'react';
import { Sprout, Menu, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="w-full bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 px-6 py-2 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="bg-brand p-1.5 rounded-lg text-white">
            <Sprout size={18} />
          </div>
          <h1 className="text-sm font-black text-slate-800 tracking-tight">VunaAI</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-slate-400">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
