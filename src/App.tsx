import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CameraCapture from './components/CameraCapture';
import DiagnosisResult from './components/DiagnosisResult';
import { analyzeCropPhoto, AnalysisResult } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { History, Sprout, ChevronLeft, Calendar, Languages, Globe, Info, Sun, Leaf, LayoutDashboard, Camera } from 'lucide-react';
import { translations, Language } from './constants/translations';

interface ScanHistoryItem {
  id: string;
  date: string;
  image: string;
  result: AnalysisResult;
}

type View = 'dashboard' | 'scanner' | 'history' | 'calendar';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [language, setLanguage] = useState<Language>('fr');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const t = translations[language];

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
          <Sprout size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.appName}</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <button 
          onClick={() => { setCurrentView('dashboard'); setDiagnosis(null); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <LayoutDashboard size={16} />
          <span>{t.dashboard}</span>
        </button>
        <button 
          onClick={() => { setCurrentView('scanner'); setDiagnosis(null); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${currentView === 'scanner' ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <Camera size={16} />
          <span>{t.diagnostic}</span>
        </button>
        <button 
          onClick={() => { setCurrentView('calendar'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${currentView === 'calendar' ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <Calendar size={16} />
          <span>{t.calendar}</span>
        </button>
        <button 
          onClick={() => { setCurrentView('history'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${currentView === 'history' ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <History size={16} />
          <span>{t.history}</span>
        </button>
      </nav>

      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
           <div className="flex items-center gap-2 mb-2">
              <Globe size={12} className="text-slate-400" />
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.localLanguage}</p>
           </div>
           <select 
             value={language}
             onChange={(e) => setLanguage(e.target.value as Language)}
             className="w-full bg-white border border-slate-200 py-2 px-2 rounded-lg text-[10px] font-bold shadow-sm focus:outline-none focus:border-brand"
           >
             {languages.map(lang => (
               <option key={lang.id} value={lang.id}>{lang.label}</option>
             ))}
           </select>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.offlineMode}</p>
          <p className="text-[10px] text-slate-500 mb-2 leading-snug">{t.offlineDesc}</p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-600">{t.ready}</span>
          </div>
        </div>
      </div>
    </>
  );

  const languages = [
    { id: 'bm', label: 'Bambara' },
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Français' },
    { id: 'ha', label: 'Hausa' },
    { id: 'sw', label: 'Swahili' },
    { id: 'wo', label: 'Wolof' },
    { id: 'yo', label: 'Yoruba' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('agri_scanner_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (result: AnalysisResult, image: string) => {
    const newItem: ScanHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('fr-FR'),
      image,
      result
    };
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('agri_scanner_history', JSON.stringify(updated));
  };

  const handleCapture = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await analyzeCropPhoto(base64, mimeType);
      setDiagnosis(result);
      saveToHistory(result, base64);
      
      setTimeout(() => {
        const resultSection = document.getElementById('diagnosis-result');
        resultSection?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'analyse.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex font-sans overflow-hidden relative">
      {/* Mobile Sidebar Backrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[240px] bg-white z-[100] flex flex-col p-6 shadow-2xl lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 hidden lg:flex flex-col p-6 space-y-6 z-20 overflow-y-auto">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <div className="fixed inset-0 bg-pattern pointer-events-none z-0" />
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="w-full max-w-5xl px-6 pt-4 pb-8 mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                  <div className="max-w-xl">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                       {t.welcome}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {t.welcomeDesc}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-brand/10 text-brand rounded-full text-[10px] font-bold uppercase tracking-widest">
                     {t.multizone}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-brand rounded-2xl p-6 text-white relative overflow-hidden shadow-sm h-48 flex flex-col justify-between">
                    <div className="relative z-10">
                      <h2 className="text-xl font-bold mb-2">{t.smartDiag}</h2>
                      <p className="opacity-90 text-xs leading-relaxed max-w-[200px]">
                        {t.smartDiagDesc}
                      </p>
                    </div>
                    <button 
                      onClick={() => setCurrentView('scanner')}
                      className="relative z-10 bg-white text-brand px-4 py-2 rounded-lg text-[10px] font-bold w-fit hover:bg-slate-50 transition-colors"
                    >
                      {t.scanCrop}
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-48 flex flex-col justify-between">
                     <div className="flex justify-between items-center">
                        <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">{t.climateState}</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-500 mb-2">{t.cropCycle}</p>
                        <div className="flex items-center gap-2 text-[10px] text-brand bg-brand-light p-3 rounded-xl font-bold cursor-pointer hover:bg-brand-light/70" onClick={() => setCurrentView('calendar')}>
                           <Calendar size={14} />
                           <span>{t.consultCalendar}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'scanner' && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {!diagnosis && !isProcessing ? (
                  <div className="space-y-6 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="bg-brand-light w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Camera className="text-brand" size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{t.newAnalysis}</h2>
                      <p className="text-xs text-slate-500 mb-8">{t.newAnalysisDesc}</p>
                      <CameraCapture onCapture={handleCapture} isProcessing={isProcessing} />
                    </div>
                  </div>
                ) : isProcessing ? (
                  <div className="py-24 text-center">
                    <div className="animate-spin text-brand inline-block mb-4">
                      <Sprout size={48} />
                    </div>
                    <p className="font-bold text-slate-600">{t.analyzing}</p>
                    <p className="text-xs text-slate-400">{t.applyingContext}</p>
                  </div>
                ) : diagnosis && (
                  <div className="space-y-6">
                    <button 
                      onClick={() => setDiagnosis(null)}
                      className="text-xs font-bold text-brand flex items-center gap-2 hover:underline"
                    >
                      <ChevronLeft size={14} /> {t.redo}
                    </button>
                    <DiagnosisResult result={diagnosis} />
                  </div>
                )}
              </motion.div>
            )}

            {currentView === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">{t.archives}</h2>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <History className="mx-auto text-slate-100 mb-4" size={64} />
                    <p className="text-slate-400 font-bold text-sm px-8">{t.noHistory}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setDiagnosis(item.result);
                          setCurrentView('scanner');
                        }}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left border border-slate-50 group"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                          <img src={item.image} alt="Crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[9px] text-brand font-black uppercase tracking-widest mb-0.5">{item.date}</p>
                          <h3 className="font-bold text-sm text-slate-900 mb-0.5">{item.result.commonName}</h3>
                          <div className={`w-fit text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${item.result.severity === 'critical' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            {item.result.severity}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {currentView === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                      <Calendar size={20} />
                    </div>
                    <h2 className="text-xl font-bold">{t.calendarTitle}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 font-medium">{t.calendarDesc}</p>
                  
                  <div className="grid gap-3">
                    {[
                      { crop: t.manioc, period: 'Mars - Juin', tip: 'Equatorial / Tropical humide', icon: '🌱' },
                      { crop: t.maize, period: 'Avril - Juillet', tip: 'Zone savane / Transition', icon: '🌽' },
                      { crop: t.sorghum, period: 'Juin - Août', tip: 'Zone Sahélienne', icon: '🌾' },
                      { crop: t.peanut, period: 'Mai - Juillet', tip: 'Toute zone tropicale', icon: '🥜' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand/20 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-bold text-sm text-slate-900">{item.crop}</p>
                            <p className="text-[10px] text-slate-400 font-medium italic">{item.tip}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-brand bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{item.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// App component ends here

