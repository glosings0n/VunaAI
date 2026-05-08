import React, { useState } from 'react';
import { ShieldCheck, FlaskConical, Info, AlertTriangle, CheckCircle2, ChevronRight, Leaf, Maximize, CloudRain, Layers, Share2, FileDown, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { AnalysisResult } from '../services/geminiService';
import { translations, Language } from '../constants/translations';
import { downloadPDF, sharePDF } from '../services/pdfService';

interface DiagnosisResultProps {
  result: AnalysisResult;
  language: Language;
}

export default function DiagnosisResult({ result, language }: DiagnosisResultProps) {
  const navigate = useNavigate();
  const t = translations[language];
  const [treatmentType, setTreatmentType] = useState<'bio' | 'chemical'>('bio');

  const handleShare = async () => {
    await sharePDF(result, language);
  };

  const handleExport = () => {
    downloadPDF(result, language);
  };

  const severityLevels = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 100
  };

  const severityColors = {
    low: 'bg-emerald-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  };

  const severityLabels = {
    low: t.severityLow,
    medium: t.severityMedium,
    high: t.severityHigh,
    critical: t.severityCritical
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-4 pb-12 px-4"
    >
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{result.commonName}</h2>
              {result.scientificName && (
                <p className="text-brand text-xs italic font-medium opacity-90 mt-0.5">{result.scientificName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="p-2.5 bg-brand/10 text-brand rounded-xl hover:bg-brand/20 transition-all flex items-center gap-2 group/share cursor-pointer"
                title={t.share}
              >
                <Share2 size={18} className="group-hover/share:scale-110 transition-transform" />
              </button>
              <button 
                onClick={handleExport}
                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 group/export cursor-pointer"
                title={t.export}
              >
                <FileDown size={18} className="group-hover/export:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Simple Severity Gauge */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t.severityLabel}</span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${severityLevels[result.severity]}%` }}
                className={`h-full ${severityColors[result.severity]}`}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-600">{severityLabels[result.severity]}</span>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg flex gap-3 items-start border border-slate-100">
          <Info className="flex-shrink-0 text-brand mt-0.5" size={16} />
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{result.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg">
        <button onClick={() => setTreatmentType('bio')} className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all text-xs font-bold cursor-pointer ${treatmentType === 'bio' ? 'bg-white shadow-sm text-brand' : 'text-slate-500 hover:bg-slate-200'}`}>
          <Leaf size={14} /> {t.treatmentBio}
        </button>
        <button onClick={() => setTreatmentType('chemical')} className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all text-xs font-bold cursor-pointer ${treatmentType === 'chemical' ? 'bg-white shadow-sm text-brand-dark' : 'text-slate-500 hover:bg-slate-200'}`}>
          <FlaskConical size={14} /> {t.treatmentChemical}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={treatmentType}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 relative group"
        >
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${treatmentType === 'bio' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  {treatmentType === 'bio' ? <Leaf size={16} className="text-emerald-600" /> : <FlaskConical size={16} className="text-slate-600" />}
                  {t.recommendedAction}
                </h3>
                <p className="text-[9px] text-slate-400 uppercase font-black">{treatmentType === 'bio' ? t.natural : t.activeIngredients}</p>
              </div>
            </div>

            {/* Efficacy Visualizer */}
            <div className="flex gap-4 items-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t.estimatedEfficacy}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`w-2 h-4 rounded-sm ${i <= (treatmentType === 'bio' ? 4 : 5) ? 'bg-brand' : 'bg-slate-200'}`} />
                    ))}
                  </div>
               </div>
               <div className="text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{t.residualRisk}</p>
                  <p className={`text-xs font-bold ${treatmentType === 'bio' ? 'text-emerald-600' : 'text-blue-600'}`}>{treatmentType === 'bio' ? t.riskLow : t.riskMinimal}</p>
               </div>
            </div>
          </div>

          <div className="text-xs text-slate-600">
            <div className="markdown-body">
              <ReactMarkdown>
                {treatmentType === 'bio' ? result.biologicalTreatment : result.chemicalTreatment}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         {result.preventionTips.map((tip, idx) => (
           <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 flex gap-2 shadow-sm">
             <CheckCircle2 size={12} className="text-brand shrink-0 mt-0.5" />
             <p className="text-[10px] leading-tight text-slate-500 font-medium">{tip}</p>
           </div>
         ))}
      </div>

      {result.spacingAdvice && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
            <div className="p-2 bg-brand/10 text-brand rounded-lg">
              <Maximize size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.spacingLabel}</h3>
              <p className="text-[9px] text-slate-400 uppercase font-black">{t.yieldOptimization}</p>
            </div>
          </div>

          <div className="bg-brand/5 p-4 rounded-xl border border-brand/10 text-center">
            <p className="text-[10px] font-bold text-brand uppercase mb-1">{t.optimalSpacing}</p>
            <p className="text-xl font-black text-brand">{result.spacingAdvice.optimalSpacing}</p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-3">
            {result.spacingAdvice.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <CloudRain size={14} />
                <span className="text-[9px] font-bold uppercase">{t.climateImpact}</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">{result.spacingAdvice.climateFactors}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Layers size={14} />
                <span className="text-[9px] font-bold uppercase">{t.soilImpact}</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">{result.spacingAdvice.soilTypeFactors}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex-1 py-4 bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
        >
          {t.newAnalysisBtn}
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => navigate('/history')}
          className="flex-1 py-4 bg-white text-slate-900 border border-slate-200 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
        >
          <History size={14} />
          {t.viewHistory}
        </button>
      </div>
    </motion.div>
  );
}
