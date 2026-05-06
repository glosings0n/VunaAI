import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Language, languages } from '../constants/translations';
import { motion, AnimatePresence } from 'motion/react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  align?: 'left' | 'right';
  className?: string;
}

export default function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange, 
  align = 'right',
  className = ""
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-brand/20 transition-all"
      >
        <div className="flex items-center gap-2">
          <img 
            src={`https://flagcdn.com/w40/${currentLang.country}.png`} 
            alt={currentLang.name}
            className="w-4 h-3 object-cover rounded-sm shadow-xs"
          />
          <span className="text-[10px] font-black text-slate-600 uppercase">{currentLang.name}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden`}
          >
            <div className="p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${currentLanguage === lang.code ? 'bg-brand/5 text-brand' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <img 
                    src={`https://flagcdn.com/w40/${lang.country}.png`} 
                    alt={lang.name}
                    className="w-5 h-3.5 object-cover rounded-sm"
                  />
                  <span className="text-[11px] font-bold uppercase">{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
