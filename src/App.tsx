import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CameraCapture from './components/CameraCapture';
import DiagnosisResult from './components/DiagnosisResult';
import { analyzeCropPhoto, AnalysisResult } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { History, Leaf, ChevronLeft, Calendar, Languages, Globe, Info, Sun, LayoutDashboard, Camera, CloudRain, Thermometer, Droplets, MapPin, Sprout } from 'lucide-react';
import { translations, Language } from './constants/translations';
import { fetchLocalWeather, WeatherData } from './services/weatherService';
import { Routes, Route, useNavigate, useLocation, NavLink, Navigate } from 'react-router-dom';

interface ScanHistoryItem {
  id: string;
  date: string;
  image: string;
  result: AnalysisResult;
}

type View = 'dashboard' | 'scanner' | 'history' | 'calendar';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [language, setLanguage] = useState<Language>('fr');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const t = translations[language];

  const handleRequestLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoadingWeather(true);
      setLocationError(false);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchLocalWeather(position.coords.latitude, position.coords.longitude);
            setWeather(data);
            setLocationError(false);
          } catch (e) {
            console.error("Weather error", e);
          } finally {
            setIsLoadingWeather(false);
          }
        },
        (err) => {
          console.warn("Geolocation denied", err);
          setLocationError(true);
          setIsLoadingWeather(false);
        },
        { timeout: 10000 }
      );
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
          <Leaf size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.appName}</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink 
          to="/dashboard"
          onClick={() => { setDiagnosis(null); setIsSidebarOpen(false); }}
          className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <LayoutDashboard size={16} />
          <span>{t.dashboard}</span>
        </NavLink>
        <NavLink 
          to="/scanner"
          onClick={() => { setDiagnosis(null); setIsSidebarOpen(false); }}
          className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <Camera size={16} />
          <span>{t.diagnostic}</span>
        </NavLink>
        <NavLink 
          to="/calendar"
          onClick={() => { setIsSidebarOpen(false); }}
          className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <Calendar size={16} />
          <span>{t.calendar}</span>
        </NavLink>
        <NavLink 
          to="/history"
          onClick={() => { setIsSidebarOpen(false); }}
          className={({ isActive }) => `w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <History size={16} />
          <span>{t.history}</span>
        </NavLink>
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

        <div className="pt-2 text-center">
          <p className="text-[8px] text-slate-300 font-bold tracking-tight uppercase">
            © 2026 VunaAI. All rights reserved.
          </p>
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

    // Fetch Weather Automatically if possible
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          handleRequestLocation();
        }
      });
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
    setCapturedImage(base64);
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
      setCapturedImage(null);
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
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
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
                    {/* Weather Widget */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 max-w-[80%]">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <h3 className="font-bold text-[10px] uppercase text-slate-400 tracking-wider truncate">
                            {weather?.locationName || (t as any).weatherTitle || 'Météo Locale'}
                          </h3>
                        </div>
                        {weather?.isRaining ? (
                          <CloudRain size={18} className="text-blue-500 animate-bounce" />
                        ) : (
                          <Sun size={18} className="text-orange-400 animate-pulse" />
                        )}
                      </div>

                      {!weather && isLoadingWeather ? (
                        <div className="py-4 space-y-2">
                          <div className="h-8 w-24 bg-slate-50 animate-pulse rounded" />
                          <div className="h-4 w-32 bg-slate-50 animate-pulse rounded" />
                        </div>
                      ) : weather ? (
                        <div className="space-y-4">
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-slate-900 leading-none">
                              {Math.round(weather.temperature)}°C
                            </span>
                            <span className="text-xs text-slate-400 font-bold mb-1">{(t as any).temperature || 'Temp'}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Droplets size={12} className="text-blue-400" />
                              <span className="text-[10px] font-bold text-slate-600">{weather.humidity}%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CloudRain size={12} className="text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-600">{weather.precipitation}mm</span>
                            </div>
                          </div>

                          <div className={`text-[10px] font-bold p-2 rounded-lg flex items-center gap-2 ${weather.isRaining ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             <Info size={12} />
                             <span>
                               {weather.isRaining 
                                 ? ((t as any).weatherWarning || 'Rain expected') 
                                 : ((t as any).weatherGood || 'Ideal conditions')}
                             </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <p className="text-[10px] text-slate-400 mb-3">
                            {locationError ? (t as any).locationDenied : (t as any).locationRequired}
                          </p>
                          <button 
                            onClick={handleRequestLocation}
                            className="w-full py-2 bg-brand/10 text-brand text-[10px] font-bold rounded-lg border border-brand/20 hover:bg-brand/20 transition-all flex items-center justify-center gap-2"
                          >
                            <MapPin size={12} />
                            {(t as any).enableLocation || 'Activer ma position'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-brand rounded-2xl p-6 text-white relative overflow-hidden shadow-sm h-48 flex flex-col justify-between">
                      <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">{t.smartDiag}</h2>
                        <p className="opacity-90 text-xs leading-relaxed max-w-[200px]">
                          {t.smartDiagDesc}
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate('/scanner')}
                        className="relative z-10 bg-white text-brand px-4 py-2 rounded-lg text-[10px] font-bold w-fit hover:bg-slate-50 transition-all font-sans"
                      >
                        {t.scanCrop}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-48 flex flex-col justify-between md:col-span-2 lg:col-span-1">
                       <div className="flex justify-between items-center">
                          <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">{t.climateState}</h3>
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 mb-2">{t.cropCycle}</p>
                          <div className="flex items-center gap-2 text-[10px] text-brand bg-brand-light p-3 rounded-xl font-bold cursor-pointer hover:bg-brand-light/70" onClick={() => navigate('/calendar')}>
                             <Calendar size={14} />
                             <span>{t.consultCalendar}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              } />

              <Route path="/scanner" element={
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
                    <div className="py-8 flex flex-col items-center">
                      <div className="mb-8 text-center">
                        <div className="inline-block animate-bounce mb-3">
                           <Sprout size={32} className="text-brand" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">{t.analyzing}</h2>
                        <p className="text-xs text-slate-400 font-medium">{t.applyingContext}</p>
                      </div>

                      {capturedImage && (
                        <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                          <img 
                            src={capturedImage} 
                            alt="Captured" 
                            className="w-full h-full object-cover grayscale-[0.5] opacity-80"
                          />
                          {/* Scanning Line Animation */}
                          <motion.div 
                            className="absolute inset-x-0 h-1 bg-brand shadow-[0_0_15px_rgba(62,142,94,0.8)] z-10"
                            initial={{ top: 0 }}
                            animate={{ top: '100%' }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 2, 
                              ease: "linear" 
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent pointer-events-none" />
                        </div>
                      )}
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
              } />

              <Route path="/history" element={
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
                            navigate('/scanner');
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
              } />

              <Route path="/calendar" element={
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
                        { crop: (t as any).manioc, period: 'Mars - Juin', tip: 'Afrique Centrale / Ouest (Zones humides)', icon: '🌱' },
                        { crop: (t as any).maize, period: 'Avril - Juillet', tip: 'Toute l\'Afrique Subsaharienne', icon: '🌽' },
                        { crop: (t as any).sorghum, period: 'Juin - Août', tip: 'Zone Sahélienne / Afrique de l\'Est', icon: '🌾' },
                        { crop: (t as any).peanut, period: 'Mai - Juillet', tip: 'Sénégal, Mali, Nigeria (Zones sèches)', icon: '🥜' },
                        { crop: (t as any).cocoa, period: 'Sept - Nov', tip: 'Côte d\'Ivoire, Ghana, Cameroun', icon: '🍫' },
                        { crop: (t as any).coffee, period: 'Oct - Jan', tip: 'Éthiopie, Kenya, Rwanda (Hautes terres)', icon: '☕' },
                        { crop: (t as any).yam, period: 'Fév - Avr', tip: 'Bénin, Nigeria, Togo (Zone forêt)', icon: '🍠' },
                        { crop: (t as any).cowpea, period: 'Juil - Sept', tip: 'Nigeria, Niger, Burkina Faso', icon: '🍲' },
                        { crop: (t as any).rice, period: 'Juin - Sept', tip: 'Madagascar, Guinée, Sénégal (Bas-fonds)', icon: '🍚' },
                        { crop: (t as any).plantain, period: 'Toute l\'année', tip: 'Afrique Centrale & Côte Atlantique', icon: '🍌' },
                        { crop: (t as any).potato, period: 'Nov - Fév', tip: 'Afrique du Nord / Afrique du Sud', icon: '🥔' },
                        { crop: (t as any).sweetPotato, period: 'Avril - Juin', tip: 'Afrique de l\'Est & Australe', icon: '🍠' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand/20 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <p className="font-bold text-sm text-slate-900">{item.crop}</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">{item.tip}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-brand bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">{item.period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// App component ends here

