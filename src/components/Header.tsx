import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../constants/translations';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 px-6 py-2 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl md:hidden">🌿</span>
          <h1 className="text-sm font-black text-slate-800">VunaAI</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={onLanguageChange} 
            compact={true}
          />
        </div>
      </div>
    </header>
  );
}
