import React, { useState } from 'react';
import { 
  Volume2, 
  Languages, 
  Sliders,
  Check
} from 'lucide-react';

function CommentarySettings() {
  const [selectedVoice, setSelectedVoice] = useState('analyst');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-[#0A1A2F] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Commentary Settings</h1>

        {/* Voice Style */}
        <div className="bg-[#0A1A2F]/50 rounded-xl p-6 mb-8 border border-gray-800">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Volume2 className="w-6 h-6 mr-2" />
            Voice Style
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <VoiceOption 
              title="Analyst Mode"
              description="Detailed statistical analysis and advanced metrics"
              isSelected={selectedVoice === 'analyst'}
              onClick={() => setSelectedVoice('analyst')}
            />
            <VoiceOption 
              title="Casual Fan Mode"
              description="Simple, engaging commentary for new fans"
              isSelected={selectedVoice === 'casual'}
              onClick={() => setSelectedVoice('casual')}
            />
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-[#0A1A2F]/50 rounded-xl p-6 mb-8 border border-gray-800">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Languages className="w-6 h-6 mr-2" />
            Language
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <LanguageOption 
              language="English"
              code="en"
              isSelected={selectedLanguage === 'en'}
              onClick={() => setSelectedLanguage('en')}
            />
            <LanguageOption 
              language="Español"
              code="es"
              isSelected={selectedLanguage === 'es'}
              onClick={() => setSelectedLanguage('es')}
            />
            <LanguageOption 
              language="日本語"
              code="jp"
              isSelected={selectedLanguage === 'jp'}
              onClick={() => setSelectedLanguage('jp')}
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Sliders className="w-6 h-6 mr-2" />
            Advanced Settings
          </h2>
          <div className="space-y-6">
            <SettingSlider 
              label="Commentary Detail Level"
              value={75}
            />
            <SettingSlider 
              label="Statistical Depth"
              value={60}
            />
            <SettingSlider 
              label="Speaking Speed"
              value={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceOption({ title, description, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-xl border ${
        isSelected ? 'border-[#00FFC2] bg-[#00FFC2]/10' : 'border-gray-800 bg-[#0A1A2F]/30'
      } text-left transition-all hover:border-[#00FFC2]`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold">{title}</h3>
        {isSelected && <Check className="w-5 h-5 text-[#00FFC2]" />}
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  );
}

function LanguageOption({ language, code, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border ${
        isSelected ? 'border-[#00FFC2] bg-[#00FFC2]/10' : 'border-gray-800 bg-[#0A1A2F]/30'
      } transition-all hover:border-[#00FFC2]`}
    >
      <div className="text-center">
        <div className="font-bold mb-1">{language}</div>
        <div className="text-sm text-gray-400 uppercase">{code}</div>
      </div>
    </button>
  );
}

function SettingSlider({ label, value }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-gray-400">{label}</label>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <div className="h-2 bg-[#0A1A2F]/30 rounded-full">
        <div 
          className="h-full bg-[#00FFC2] rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default CommentarySettings;