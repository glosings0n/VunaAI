import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import CameraCapture from './components/CameraCapture';
import DiagnosisResult from './components/DiagnosisResult';
import { analyzeCropPhoto, AnalysisResult } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { History, ChevronLeft, Calendar, Languages, Info, Sun, LayoutDashboard, Camera, CloudRain, Thermometer, Droplets, MapPin, Sprout, Settings as SettingsIcon, Trash2, AlertTriangle, Share2, FileDown, Globe } from 'lucide-react';
import { translations, Language, languages } from './constants/translations';
import { fetchLocalWeather, WeatherData } from './services/weatherService';
import { downloadPDF, sharePDF } from './services/pdfService';
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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('East');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const t = translations[language];

  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) return;

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        } else if (permission === 'denied') {
          alert("Les notifications sont désactivées dans votre navigateur. Veuillez les autoriser pour recevoir les alertes.");
          setNotificationsEnabled(false);
        } else {
          // User closed the popup without choosing
          setNotificationsEnabled(false);
        }
      } catch (err) {
        console.error("Error requesting notifications", err);
        setNotificationsEnabled(false);
      }
    }
  };

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

            // Auto language detection based on country
            if (data.countryCode) {
              const englishSpeaking = [
                'US', 'GB', 'CA', 'AU', 'NZ', 'IE', // General
                'ZA', 'NG', 'KE', 'TZ', 'GH', 'UG', 'ZW', 'ZM', 'MW', 'BW', 'NA', 'SL', 'LR', 'GM', 'ET', 'SD', 'MU', 'SC', 'LS', 'SZ' // Africa
              ];
              const detectedLang: Language = englishSpeaking.includes(data.countryCode) ? 'en' : 'fr';
              setLanguage(detectedLang);
            }
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
        { 
          timeout: 15000, 
          enableHighAccuracy: true,
          maximumAge: 0
        }
      );
    }
  };

  const currentYear = new Date().getUTCFullYear();

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 mb-8 lg:px-0 px-2 justify-center lg:justify-start">
        <span className="text-2xl">🌿</span>
        <div className="hidden lg:block">
          <h1 className="text-lg font-extrabold text-slate-900">{t.appName}</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink 
          to="/dashboard"
          onClick={() => { setDiagnosis(null); }}
          className={({ isActive }) => `w-full flex items-center lg:gap-3 p-3 rounded-xl text-xs font-bold transition-all justify-center lg:justify-start ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <LayoutDashboard size={20} className="lg:w-4 lg:h-4" />
          <span className="hidden lg:inline">{t.dashboard}</span>
        </NavLink>
        <NavLink 
          to="/scanner"
          onClick={() => { setDiagnosis(null); }}
          className={({ isActive }) => `w-full flex items-center lg:gap-3 p-3 rounded-xl text-xs font-bold transition-all justify-center lg:justify-start ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <Camera size={20} className="lg:w-4 lg:h-4" />
          <span className="hidden lg:inline">{t.diagnostic}</span>
        </NavLink>
        <NavLink 
          to="/calendar"
          className={({ isActive }) => `w-full flex items-center lg:gap-3 p-3 rounded-xl text-xs font-bold transition-all justify-center lg:justify-start ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <Calendar size={20} className="lg:w-4 lg:h-4" />
          <span className="hidden lg:inline">{t.calendar}</span>
        </NavLink>
        <NavLink 
          to="/history"
          className={({ isActive }) => `w-full flex items-center lg:gap-3 p-3 rounded-xl text-xs font-bold transition-all justify-center lg:justify-start ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <History size={20} className="lg:w-4 lg:h-4" />
          <span className="hidden lg:inline">{t.history}</span>
        </NavLink>
        <NavLink 
          to="/settings"
          className={({ isActive }) => `w-full flex items-center lg:gap-3 p-3 rounded-xl text-xs font-bold transition-all justify-center lg:justify-start ${isActive ? 'bg-slate-50 text-brand outline-1 outline-slate-100' : 'text-slate-400 hover:text-brand'}`}
        >
          <SettingsIcon size={20} className="lg:w-4 lg:h-4" />
          <span className="hidden lg:inline">{t.settings}</span>
        </NavLink>
      </nav>
      
      <div className="pt-4 border-t border-slate-50 lg:block hidden">
        <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block tracking-wider">{t.localLanguage}</label>
        <LanguageSelector 
          currentLanguage={language} 
          onLanguageChange={setLanguage}
          align="left"
          className="mb-4"
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-50 lg:block hidden">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.offlineMode}</p>
          <p className="text-[10px] text-slate-500 mb-2 leading-snug">{t.offlineDesc}</p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-600">{t.ready}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <p className="text-[8px] text-slate-300 font-bold hidden lg:block">
          © {currentYear} LosingTech. All rights reserved.
        </p>
      </div>
    </>
  );

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

    // Request notifications permission on mount if enabled
    if (notificationsEnabled && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          setNotificationsEnabled(false);
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

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updated = history.filter(item => item.id !== itemToDelete);
      setHistory(updated);
      localStorage.setItem('agri_scanner_history', JSON.stringify(updated));
      setItemToDelete(null);
    }
  };
  
  const handleShareResult = async (item: ScanHistoryItem | AnalysisResult) => {
    const result = 'result' in item ? item.result : item;
    await sharePDF(result, language);
  };

  const handleExportResult = (item: ScanHistoryItem | AnalysisResult) => {
    const result = 'result' in item ? item.result : item;
    downloadPDF(result, language);
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
    <div className="h-svh bg-brand-bg flex font-sans overflow-hidden relative">
      {/* Desktop Sidebar (Medium = Rail, Large = Full) */}
      <aside className="md:w-20 lg:w-60 bg-white border-r border-slate-100 hidden md:flex flex-col p-4 lg:p-6 space-y-6 z-20 overflow-y-auto transition-all duration-300">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="fixed inset-0 bg-pattern pointer-events-none z-0" />
        <Header 
          language={language}
          onLanguageChange={setLanguage}
        />
        <main className="flex-1 w-full max-w-5xl px-6 pt-4 pb-24 md:pb-8 mx-auto relative z-10 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 pb-4"
                >
                  <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col group">
                    <div className="p-6 pb-2 relative z-10">
                      <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                         {t.welcome}
                      </h1>
                    </div>
                    <div className="w-full h-64 md:h-[350px] relative overflow-hidden bg-slate-100">
                      <img 
                        src="/assets/hero.png" 
                        alt="African farmer checking crops with technology" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onLoad={(e) => (e.currentTarget.parentElement!.style.backgroundColor = 'transparent')}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-white/95 via-white/30 to-transparent"></div>
                      
                      {/* Floating Indicator Overlay */}
                      <button 
                        onClick={() => navigate('/scanner')}
                        className="absolute bottom-6 left-8 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/50 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all group/vuna"
                      >
                        <span className="text-2xl group-hover/vuna:rotate-12 transition-transform">🌿</span>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-black text-slate-800 tracking-tight">VunaAI</p>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          </div>
                          <p className="text-[10px] text-brand font-bold">{t.launchScan} →</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {/* Weather Widget */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm h-44 md:h-48 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5 max-w-[85%]">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <h3 className="font-bold text-[9px] md:text-[10px] uppercase text-slate-400 truncate">
                            {weather?.locationName || (t as any).weatherTitle || 'Météo Locale'}
                          </h3>
                        </div>
                        {weather?.isRaining ? (
                          <CloudRain size={16} className="text-blue-500 shrink-0" />
                        ) : (
                          <Sun size={16} className="text-orange-400 shrink-0" />
                        )}
                      </div>

                      {locationError ? (
                        <div className="flex flex-col items-center justify-center -mt-4 text-center space-y-1">
                          <p className="text-[9px] font-black text-slate-800 uppercase">{(t as any).locationError}</p>
                          <button 
                            onClick={handleRequestLocation}
                            className="mt-1 text-[8px] font-bold text-brand bg-brand/10 px-2 py-1 rounded-lg"
                          >
                            {(t as any).retry}
                          </button>
                        </div>
                      ) : !weather && isLoadingWeather ? (
                        <div className="flex flex-col items-center justify-center h-full -mt-4">
                          <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                        </div>
                      ) : weather ? (
                        <div className="space-y-3">
                          <div className="flex items-end gap-1.5">
                            <span className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                              {Math.round(weather.temperature)}°C
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Droplets size={10} className="text-blue-400" />
                              <span className="text-[9px] font-bold text-slate-600">{weather.humidity}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CloudRain size={10} className="text-slate-400" />
                              <span className="text-[9px] font-bold text-slate-600">{weather.precipitation}mm</span>
                            </div>
                          </div>

                          <div className={`text-[8px] md:text-[9px] font-bold p-1.5 rounded-lg flex items-center gap-1.5 ${weather.isRaining ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             <Info size={10} className="shrink-0" />
                             <span className="truncate">
                               {weather.isRaining 
                                 ? ((t as any).weatherWarning || 'Pluie') 
                                 : ((t as any).weatherGood || 'Beau temps')}
                             </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full -mt-4 text-center">
                          <button 
                            onClick={handleRequestLocation}
                            className="text-[9px] font-black text-brand uppercase bg-brand/10 px-3 py-2 rounded-xl"
                          >
                            {t.enableLocation}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="hidden lg:flex bg-brand rounded-2xl p-6 text-white relative overflow-hidden shadow-sm h-48 flex-col justify-between">
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

                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm h-44 md:h-48 flex flex-col justify-between">
                       <div className="flex justify-between items-center">
                          <h3 className="font-bold text-[9px] md:text-xs uppercase text-slate-400">{t.climateState}</h3>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                       </div>
                       <div>
                          <p className="text-[9px] md:text-[10px] text-slate-500 mb-2 line-clamp-2 md:line-clamp-none">{t.cropCycle}</p>
                          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-brand bg-brand-light p-2 md:p-3 rounded-xl font-bold cursor-pointer hover:bg-brand-light/70" onClick={() => navigate('/calendar')}>
                             <Calendar size={12} className="shrink-0" />
                             <span className="truncate">{t.consultCalendar}</span>
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
                  className="space-y-8 min-h-[60vh] flex flex-col items-center justify-center"
                >
                  {!diagnosis && !isProcessing ? (
                    <div className="space-y-6 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="bg-brand-light w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Camera className="text-brand" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{t.newAnalysis}</h2>
                        <p className="text-xs text-slate-500 mb-8">{t.newAnalysisDesc}</p>
                        <CameraCapture onCapture={handleCapture} isProcessing={isProcessing} language={language} />
                      </div>
                    </div>
                  ) : isProcessing ? (
                    <div className="py-8 flex flex-col items-center">
                      <div className="mb-8 text-center">
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
                      <DiagnosisResult result={diagnosis} language={language} />
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
                        <div
                          key={item.id}
                          onClick={() => {
                            setDiagnosis(item.result);
                            navigate('/scanner');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setDiagnosis(item.result);
                              navigate('/scanner');
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left border border-slate-50 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                            <img src={item.image} alt="Crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[9px] text-brand font-black uppercase mb-0.5">{item.date}</p>
                                <h3 className="font-bold text-sm text-slate-900 mb-0.5">{item.result.commonName}</h3>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleShareResult(item); }}
                                  className="p-1.5 text-slate-300 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                                  title={t.share}
                                >
                                  <Share2 size={14} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleExportResult(item); }}
                                  className="p-1.5 text-slate-300 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                                  title={t.export}
                                >
                                  <FileDown size={14} />
                                </button>
                                <button 
                                  onClick={(e) => deleteFromHistory(item.id, e)}
                                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className={`w-fit text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${item.result.severity === 'critical' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                              {item.result.severity}
                            </div>
                          </div>
                        </div>
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
                    
                    {/* Region Tabs */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                      {[
                        { id: 'East', label: (t as any).regionEast },
                        { id: 'West', label: (t as any).regionWest },
                        { id: 'Central', label: (t as any).regionCentral },
                        { id: 'North', label: (t as any).regionNorth },
                        { id: 'South', label: (t as any).regionSouth }
                      ].map((region) => (
                        <button
                          key={region.id}
                          onClick={() => setActiveRegion(region.id)}
                          className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${activeRegion === region.id ? 'bg-brand text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                          {region.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-3">
                      {( ( {
                        East: [
                          { crop: (t as any).maize, period: 'Mars - Mai / Oct - Déc', tip: 'Deux saisons (Est de la RDC, Ouganda)', icon: '🌽' },
                          { crop: (t as any).coffee, period: 'Avril - Juillet', tip: 'Kenya, Ouganda, Est de la RDC (Kivu)', icon: '☕' },
                          { crop: (t as any).sorghum, period: 'Avril - Juin', tip: 'Zones semi-arides (Tanzanie, Soudan)', icon: '🌾' },
                          { crop: (t as any).sweetPotato, period: 'Mars - Juin', tip: 'Région des Grands Lacs (Inclus Est RDC)', icon: '🍠' },
                          { crop: (t as any).tea, period: 'Toute l\'année', tip: 'Récolte continue (Est RDC, Rwanda, Kenya)', icon: '🍃' }
                        ],
                        West: [
                          { crop: (t as any).cocoa, period: 'Octobre - Décembre', tip: 'Côte d\'Ivoire, Ghana (Bassin forestier)', icon: '🍫' },
                          { crop: (t as any).maize, period: 'Mars - Mai (Sud) / Mai - Juillet (Nord)', icon: '🌽', tip: 'Transition zone humide/aride' },
                          { crop: (t as any).yam, period: 'Février - Avril', tip: 'Nigéria, Bénin (Ceinture de l\'igname)', icon: '🍠' },
                          { crop: (t as any).millet, period: 'Juin - Août', tip: 'Zone Sahélienne (Sénégal, Mali, Niger)', icon: '🌾' },
                          { crop: (t as any).peanut, period: 'Mai - Juillet', tip: 'Sénégal, Gambie, Guinée', icon: '🥜' }
                        ],
                        Central: [
                          { crop: (t as any).manioc, period: 'Mars - Juin', tip: 'Culture de base (RDC, Congo, Cameroun)', icon: '🌱' },
                          { crop: (t as any).plantain, period: 'Toute l\'année', tip: 'Zones forestières humides équatoriales', icon: '🍌' },
                          { crop: (t as any).cocoa, period: 'Septembre - Novembre', tip: 'Cameroun, Gabon (Bassin du Congo)', icon: '🍫' },
                          { crop: (t as any).palmOil, period: 'Toute l\'année', tip: 'Zone équatoriale (Récolte pic Fév-Mai)', icon: '🌴' }
                        ],
                        North: [
                          { crop: (t as any).wheat, period: 'Novembre - Janvier', tip: 'Maghreb (Cultures d\'hiver irriguées)', icon: '🌾' },
                          { crop: (t as any).olive, period: 'Octobre - Décembre', tip: 'Bassin méditerranéen (Tunisie, Maroc)', icon: '🫒' },
                          { crop: (t as any).citrus, period: 'Novembre - Février', tip: 'Égypte, Maroc (Exportation)', icon: '🍊' },
                          { crop: (t as any).dates, period: 'Août - Octobre', tip: 'Algérie, Égypte (Zones oasiennes)', icon: '🌴' }
                        ],
                        South: [
                          { crop: (t as any).maize, period: 'Octobre - Décembre', tip: 'Afrique du Sud, Zambie, Zimbabwe', icon: '🌽' },
                          { crop: (t as any).sunflower, period: 'Novembre - Janvier', tip: 'Rotation de cultures (Zone tempérée)', icon: '🌻' },
                          { crop: (t as any).sugarCane, period: 'Avril - Juin', tip: 'KwaZulu-Natal, Maurice, Mozambique', icon: '🎋' },
                          { crop: (t as any).grapes, period: 'Janvier - Mars', tip: 'Région du Cap (Afrique du Sud)', icon: '🍇' }
                        ]
                      } as any)[activeRegion] || [] ).map((item: any, i: number) => (
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

              <Route path="/settings" element={
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-6 max-w-2xl mx-auto py-4"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                      <SettingsIcon size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{t.settings}</h2>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                      <h3 className="text-sm font-black text-slate-900 uppercase mb-4">{t.preferences}</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{t.localLanguage}</p>
                            <p className="text-xs text-slate-500">{t.interfaceLanguageDesc}</p>
                          </div>
                          <LanguageSelector 
                            currentLanguage={language} 
                            onLanguageChange={setLanguage}
                            className="w-48"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{t.rainNotifications}</p>
                            <p className="text-xs text-slate-500">{t.rainNotificationsDesc}</p>
                          </div>
                          <div 
                            onClick={handleToggleNotifications}
                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${notificationsEnabled ? 'bg-brand' : 'bg-slate-200'}`}
                          >
                            <motion.div 
                              animate={{ x: notificationsEnabled ? 24 : 4 }}
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50/50">
                      <h3 className="text-sm font-black text-slate-400 uppercase mb-4">{t.about}</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">{t.version}</span>
                          <span className="text-slate-900">0.1.0-alpha</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl border border-slate-100 flex items-center justify-between p-2 px-6 rounded-3xl shadow-2xl z-50">
          <NavLink 
            to="/dashboard"
            onClick={() => setDiagnosis(null)}
            className={({ isActive }) => `p-2.5 rounded-2xl transition-all ${isActive ? 'text-brand bg-brand/5' : 'text-slate-400'}`}
          >
            <LayoutDashboard size={22} strokeWidth={2.5} />
          </NavLink>
          <NavLink 
            to="/calendar"
            className={({ isActive }) => `p-2.5 rounded-2xl transition-all ${isActive ? 'text-brand bg-brand/5' : 'text-slate-400'}`}
          >
            <Calendar size={22} strokeWidth={2.5} />
          </NavLink>
          
          <NavLink 
            to="/scanner"
            onClick={() => setDiagnosis(null)}
            className={({ isActive }) => `relative -top-6 w-14 h-14 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 ${isActive ? 'bg-slate-900 text-white scale-110 shadow-slate-900/40' : 'bg-brand text-white shadow-brand/40 hover:scale-105 active:scale-95'}`}
          >
            <Camera size={28} strokeWidth={2.5} />
          </NavLink>

          <NavLink 
            to="/history"
            className={({ isActive }) => `p-2.5 rounded-2xl transition-all ${isActive ? 'text-brand bg-brand/5' : 'text-slate-400'}`}
          >
            <History size={22} strokeWidth={2.5} />
          </NavLink>
          <NavLink 
            to="/settings"
            className={({ isActive }) => `p-2.5 rounded-2xl transition-all ${isActive ? 'text-brand bg-brand/5' : 'text-slate-400'}`}
          >
            <SettingsIcon size={22} strokeWidth={2.5} />
          </NavLink>
        </nav>
      </div>

      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.deleteConfirmTitle}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.deleteConfirmDesc}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// App component ends here

