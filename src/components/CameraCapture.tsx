import React, { useRef, useState } from 'react';
import { Camera, Upload, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64: string, mimeType: string) => void;
  isProcessing: boolean;
}

export default function CameraCapture({ onCapture, isProcessing }: CameraCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onCapture(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      // Trigger flash and zoom effect
      setIsFlashing(true);
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      
      // Short delay to let the animation play before switching views
      setTimeout(() => {
        // Stop camera
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        
        setPreview(base64);
        setIsCameraActive(false);
        setIsFlashing(false);
        onCapture(base64, 'image/jpeg');
      }, 200);
    }
  };

  const reset = () => {
    setPreview(null);
    setIsCameraActive(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <AnimatePresence mode="wait">
        {!preview && !isCameraActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-2 gap-4"
          >
            <button
              onClick={startCamera}
              className="flex items-center gap-3 p-6 bg-brand text-white rounded-xl shadow-sm hover:bg-brand-dark transition-all group"
            >
              <div className="p-3 bg-white/20 rounded-lg group-hover:scale-105 transition-transform">
                <Camera size={24} />
              </div>
              <span className="font-bold text-sm">Scanner</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 p-6 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:bg-slate-50 transition-all group"
            >
              <div className="p-3 bg-slate-100 rounded-lg group-hover:scale-105 transition-transform">
                <Upload size={24} />
              </div>
              <span className="font-bold text-sm">Importer</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </button>
          </motion.div>
        )}

        {isCameraActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: isFlashing ? 1.05 : 1
            }}
            transition={{ duration: 0.2 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-square md:aspect-video"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />

            {/* Flash Effect */}
            <AnimatePresence>
              {isFlashing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-50 transition-opacity"
                />
              )}
            </AnimatePresence>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <button 
                onClick={takePhoto}
                disabled={isFlashing}
                className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-white rounded-full border-2 border-brand" />
              </button>
              <button 
                onClick={reset}
                className="absolute right-6 bottom-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white"
              >
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}

        {preview && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl bg-white aspect-square md:aspect-video">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              {isProcessing && (
                <div className="absolute inset-0 bg-brand/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <RefreshCw className="animate-spin mb-4" size={48} />
                  <p className="font-bold text-xl px-4 text-center">Analyse de la culture en cours...</p>
                  <p className="text-sm opacity-80">Notre IA identifie les maladies</p>
                </div>
              )}
            </div>
            {!isProcessing && (
              <button 
                onClick={reset}
                className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
