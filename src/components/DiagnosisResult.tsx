import React, { useState } from 'react';
import { ShieldCheck, FlaskConical, Info, AlertTriangle, CheckCircle2, ChevronRight, Leaf, Maximize, CloudRain, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../services/geminiService';

interface DiagnosisResultProps {
  result: AnalysisResult;
}

export default function DiagnosisResult({ result }: DiagnosisResultProps) {
  const [treatmentType, setTreatmentType] = useState<'bio' | 'chemical'>('bio');

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
    low: 'Faible',
    medium: 'Moyen',
    high: 'Élevé',
    critical: 'Critique'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-4 pb-12 px-4"
    >
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{result.commonName}</h2>
            {result.scientificName && (
              <p className="text-brand text-xs italic font-semibold">{result.scientificName}</p>
            )}
          </div>
          
          {/* Simple Severity Gauge */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Niveau de Gravité</span>
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
        <button onClick={() => setTreatmentType('bio')} className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all text-xs font-bold ${treatmentType === 'bio' ? 'bg-white shadow-sm text-brand' : 'text-slate-500 hover:bg-slate-200'}`}>
          <Leaf size={14} /> Biologique
        </button>
        <button onClick={() => setTreatmentType('chemical')} className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all text-xs font-bold ${treatmentType === 'chemical' ? 'bg-white shadow-sm text-brand-dark' : 'text-slate-500 hover:bg-slate-200'}`}>
          <FlaskConical size={14} /> Chimique
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
                <h3 className="text-sm font-bold">Action Recommandée</h3>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{treatmentType === 'bio' ? 'Naturelle' : 'Matières Actives'}</p>
              </div>
            </div>

            {/* Efficacy Visualizer */}
            <div className="flex gap-4 items-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Efficacité Estimée</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`w-2 h-4 rounded-sm ${i <= (treatmentType === 'bio' ? 4 : 5) ? 'bg-brand' : 'bg-slate-200'}`} />
                    ))}
                  </div>
               </div>
               <div className="text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Risque résiduel</p>
                  <p className={`text-xs font-bold ${treatmentType === 'bio' ? 'text-emerald-600' : 'text-blue-600'}`}>{treatmentType === 'bio' ? 'Bas' : 'Minime'}</p>
               </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 prose prose-sm max-w-none prose-emerald">
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
              <h3 className="text-sm font-bold text-slate-900">Conseils d'Espacement</h3>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Optimisation du Rendement</p>
            </div>
          </div>

          <div className="bg-brand/5 p-4 rounded-xl border border-brand/10 text-center">
            <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">Espacement Optimal</p>
            <p className="text-xl font-black text-brand tracking-tight">{result.spacingAdvice.optimalSpacing}</p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-3">
            {result.spacingAdvice.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <CloudRain size={14} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Climat</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">{result.spacingAdvice.climateFactors}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Layers size={14} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Sol</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug">{result.spacingAdvice.soilTypeFactors}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full py-4 bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
      >
        Lancer une nouvelle analyse
        <ChevronRight size={14} />
      </button>
    </motion.div>
  );
}
