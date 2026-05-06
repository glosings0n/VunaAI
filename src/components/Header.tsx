import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../constants/translations';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onMenuClick?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ onMenuClick, language, onLanguageChange }: HeaderProps) {
  const navigate = useNavigate();

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
          <span className="text-xl">🌿</span>
          <h1 className="text-sm font-black text-slate-800">VunaAI</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={onLanguageChange} 
          />

          <button 
            onClick={() => navigate('/settings')}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-slate-400 hover:text-brand transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
