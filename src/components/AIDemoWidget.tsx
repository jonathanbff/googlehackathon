import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Play, Loader } from 'lucide-react';

export function AIDemoWidget() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setIsProcessing(true);
      simulateProcessing();
    }
  };

  const simulateProcessing = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 200);
  };

  return (
    <div className="bg-[#0A1A2F]/90 backdrop-blur-lg p-8 rounded-2xl border border-gray-800">
      <h3 className="text-2xl font-bold mb-6">{t('techDemo.title')}</h3>
      
      <div className="relative">
        <div className="aspect-video bg-[#0A1A2F]/50 rounded-xl overflow-hidden border border-gray-800">
          {!isProcessing ? (
            <label className="flex flex-col items-center justify-center h-full cursor-pointer">
              <Upload className="w-12 h-12 mb-4 text-[#00FFC2]" />
              <span className="text-lg font-semibold">{t('techDemo.upload')}</span>
              <input type="file" className="hidden" accept="video/*" onChange={handleUpload} />
            </label>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="w-12 h-12 mb-4 text-[#00FFC2] animate-spin" />
              <div className="text-lg font-semibold mb-4">{t('techDemo.processing')}</div>
              <div className="w-64 h-2 bg-[#0A1A2F]/30 rounded-full">
                <div 
                  className="h-full bg-[#00FFC2] rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[#0A1A2F]/30 border border-gray-800">
          <div className="text-sm text-gray-400 mb-1">{t('techDemo.stats.speed')}</div>
          <div className="text-2xl font-bold">1.2s</div>
        </div>
        <div className="p-4 rounded-lg bg-[#0A1A2F]/30 border border-gray-800">
          <div className="text-sm text-gray-400 mb-1">{t('techDemo.stats.accuracy')}</div>
          <div className="text-2xl font-bold">98.5%</div>
        </div>
      </div>
    </div>
  );
}