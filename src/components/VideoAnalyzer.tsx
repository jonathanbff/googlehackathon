import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Pause, Camera, SkipBack, SkipForward, RefreshCw, MessageSquare, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeFrame, extractGameEvents, extractPlayerMetrics } from '../services/visionService';
import { generateVideoNarration, analyzeGameHighlights, chatWithGemini } from '../services/geminiService';
import { GameEvent, PlayerMetric, GameEventType, GameStats } from '../types/game';
import GameChat from './GameChat';
import { motion, AnimatePresence } from 'framer-motion';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

interface VideoAnalyzerProps {
  video: YouTubeVideo;
  onEventsDetected: (events: GameEvent[]) => void;
  onMetricsDetected: (metrics: PlayerMetric[]) => void;
}

// Event type colors mapping
const EVENT_COLORS: Record<GameEventType, { bg: string; text: string }> = {
  hit: { bg: 'rgba(0, 255, 194, 0.2)', text: '#00FFC2' },
  pitch: { bg: 'rgba(255, 171, 0, 0.2)', text: '#FFAB00' },
  run: { bg: 'rgba(99, 102, 241, 0.2)', text: '#818CF8' },
  out: { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' }
};

// Mock data for testing
const MOCK_EVENTS: GameEvent[] = [
  {
    type: 'pitch',
    timestamp: new Date().toISOString(),
    description: 'Fastball, 95mph',
    inning: 1,
    half: 'top'
  },
  {
    type: 'hit',
    timestamp: new Date().toISOString(),
    description: 'Line drive to center field',
    inning: 1,
    half: 'top'
  },
  {
    type: 'run',
    timestamp: new Date().toISOString(),
    description: 'Runner advancing to second base',
    inning: 1,
    half: 'top'
  }
];

const MOCK_METRICS: PlayerMetric[] = [
  {
    name: 'John Smith',
    position: 'Pitcher',
    stats: {
      pitchSpeed: '95 mph',
      pitchCount: 42,
      accuracy: '78%',
    },
  },
  {
    name: 'Mike Johnson',
    position: 'Batter',
    stats: {
      battingAvg: '.325',
      hits: 87,
      homeRuns: 12,
    },
  },
];

const EmptyState: React.FC<{ title: string; message: string; icon: React.ReactNode }> = ({ title, message, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl border border-white/5 p-8 flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 mb-4 text-gray-400 flex items-center justify-center">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-white/90 mb-2">{title}</h4>
    <p className="text-gray-400 max-w-md">{message}</p>
  </motion.div>
);

// Add new interfaces
interface AnalysisSection {
  title: string;
  content: string[];
  isExpanded?: boolean;
  icon?: React.ReactNode;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  video,
  onEventsDetected,
  onMetricsDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analysisInterval, setAnalysisInterval] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [narration, setNarration] = useState<string>('');
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Game Summary']);
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, [analysisInterval]);

  useEffect(() => {
    // Determine if it's a YouTube video and set up the player
    const isYT = video.id !== 'local';
    setIsYouTubeVideo(isYT);

    if (!isYT && videoRef.current) {
      videoRef.current.src = video.url;
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current?.duration || 0);
      };
    }
  }, [video]);

  useEffect(() => {
    const initializeVideo = async () => {
      try {
        setIsInitializing(true);
        setLoadingProgress(0);
        
        // Simulate loading steps
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingProgress(25);
        
        // Get initial game analysis
        const result = await analyzeGameHighlights(video.url);
        if (result) {
          setGameStats(result.stats);
          setNarration(result.narration);
        }
        
        setLoadingProgress(50);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingProgress(75);
        
        // Final initialization
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingProgress(100);
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing video:', error);
        setIsInitializing(false);
      }
    };

    if (video) {
      initializeVideo();
    }
  }, [video]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 5;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 5;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  const toggleAutoAnalyze = () => {
    if (autoAnalyze) {
      if (analysisInterval) {
        clearInterval(analysisInterval);
        setAnalysisInterval(null);
      }
    } else {
      // Analyze every 2 seconds when auto-analyze is enabled
      const interval = window.setInterval(analyzeCurrentFrame, 2000);
      setAnalysisInterval(interval);
    }
    setAutoAnalyze(!autoAnalyze);
  };

  const analyzeCurrentFrame = async () => {
    try {
      setIsAnalyzing(true);
      
      // For testing, use mock data instead of actual API calls
      if (process.env.NODE_ENV === 'development') {
        onEventsDetected(MOCK_EVENTS);
        onMetricsDetected(MOCK_METRICS);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      } else {
        const frameDataUrl = captureFrame();
        if (frameDataUrl) {
          const annotations = await analyzeFrame(frameDataUrl);
          const newEvents = extractGameEvents(annotations);
          const newMetrics = extractPlayerMetrics(annotations);
          
          // Convert Vision API events to GameEvent type
          const gameEvents: GameEvent[] = newEvents.map(event => ({
            type: event.type as GameEventType,
            timestamp: event.timestamp,
            description: event.description,
            inning: 1, // You'll need to track the current inning
            half: 'top' // You'll need to track the current half-inning
          }));
          
          onEventsDetected(gameEvents);
          onMetricsDetected(newMetrics);
        }
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateNarration = async () => {
    try {
      setIsGeneratingNarration(true);
      const result = await analyzeGameHighlights(video.url);
      setNarration(result.narration);
      setGameStats(result.stats);
      
      // Update events and metrics
      onEventsDetected(result.stats.events);
      onMetricsDetected(result.stats.players);
    } catch (error) {
      console.error('Error generating narration:', error);
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const question = chatMessage.trim();
    setChatMessage('');
    
    try {
      // Create a structured context from the game analysis
      const context = `I am an AI baseball analyst assistant. Here's the current game analysis I'm referring to:

${narration}

Additional context:
- Game Statistics Summary:
${gameStats?.summary ? `
Pitching:
- Strike Rate: ${gameStats.summary.pitching.strikeRate}
- First Pitch Strikes: ${gameStats.summary.pitching.firstPitchStrikes}
- Ground Ball Rate: ${gameStats.summary.pitching.groundBallRate}
- Swing & Miss Rate: ${gameStats.summary.pitching.swingMissRate}

Batting:
- Team BABIP: ${gameStats.summary.batting.teamBabip}
- Hard Hit Rate: ${gameStats.summary.batting.hardHitRate}
- Exit Velocity Avg: ${gameStats.summary.batting.exitVelocity}
- Contact Rate: ${gameStats.summary.batting.contactRate}
` : ''}

${gameStats?.players ? `
Key Players Performance:
${gameStats.players.map(player => `
${player.name} (${player.position}):
${Object.entries(player.stats).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
${player.highlights ? `Highlights:\n${player.highlights.join('\n')}` : ''}
`).join('\n')}
` : ''}

Please provide a detailed, professional analysis in response to the following question about this game:
${question}`;

      const response = await chatWithGemini([
        { role: 'assistant', content: context },
        { role: 'user', content: question }
      ]);

      setChatHistory(prev => [...prev, { 
        question, 
        answer: response 
      }]);

      // Auto-scroll to the latest message
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-history');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error getting chat response:', error);
      setChatHistory(prev => [...prev, { 
        question, 
        answer: "I apologize, but I'm having trouble analyzing that right now. Please try asking your question again." 
      }]);
    }
  };

  const renderAnalysisSection = (section: AnalysisSection) => {
    const isExpanded = expandedSections.includes(section.title);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-white/5 last:border-b-0"
      >
        <button
          onClick={() => toggleSection(section.title)}
          className="w-full px-6 py-4 flex items-center justify-between group hover:bg-white/5 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-3">
            {section.icon}
            <h4 className="text-lg font-semibold text-white/90 group-hover:text-cyan-400 transition-colors">
              {section.title}
            </h4>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 space-y-2">
                {section.content.map((line, idx) => (
                  <p key={idx} className="text-gray-300 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const parseNarrationSections = (narration: string): AnalysisSection[] => {
    const sections = narration.split('\n\n').map(section => {
      const [title, ...content] = section.split('\n');
      return {
        title: title.replace(/[\[\]]/g, ''),
        content: content.filter(line => line.trim()),
        icon: getIconForSection(title.replace(/[\[\]]/g, ''))
      };
    });
    return sections;
  };

  const getIconForSection = (title: string) => {
    switch (title) {
      case 'Game Summary':
        return <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>;
      case 'Key Players':
        return <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>;
      case 'Game Flow Analysis':
        return <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>;
      case 'Strategic Insights':
        return <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>;
      case 'Statistical Highlights':
        return <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>;
      case 'Game-Changing Moments':
        return <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>;
      default:
        return null;
    }
  };

  const renderPlayerStats = () => {
    if (!gameStats?.players || gameStats.players.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-white/90 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-300 rounded-full mr-3" />
            Player Statistics
          </h3>
          <EmptyState
            title="No Player Statistics Available"
            message="Player statistics will appear here once the game analysis is complete. Try analyzing the video to generate player stats."
            icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>}
          />
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <h3 className="text-2xl font-bold mb-6 text-white/90 flex items-center">
          <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-300 rounded-full mr-3" />
          Player Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameStats.players.map((player, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white/90 group-hover:text-cyan-400 transition-colors">{player.name}</h4>
                  <p className="text-sm text-cyan-400/90">{player.position}</p>
                </div>
                <div className="bg-white/5 px-3 py-1 rounded-full group-hover:bg-cyan-400/10 transition-colors">
                  <span className="text-xs text-white/70 group-hover:text-cyan-400">#{index + 1}</span>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(player.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center group-hover:bg-white/5 px-2 py-1 rounded transition-colors">
                    <span className="text-sm text-gray-400">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-sm font-medium text-white/90">{value}</span>
                  </div>
                ))}
              </div>
              {player.highlights && player.highlights.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-sm font-medium text-white/80 mb-2">Highlights</p>
                  <div className="space-y-2">
                    {player.highlights.map((highlight: string, i: number) => (
                      <p key={i} className="text-sm text-gray-400 flex items-start group-hover:bg-white/5 p-2 rounded transition-colors">
                        <span className="text-cyan-400 mr-2">•</span>
                        {highlight}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderGameEvents = () => {
    if (!gameStats?.events || gameStats.events.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-white/90 flex items-center">
            <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-300 rounded-full mr-3" />
            Game Events
          </h3>
          <EmptyState
            title="No Game Events Recorded"
            message="Game events will be displayed here as they occur during the analysis. Start the video analysis to track game events."
            icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <h3 className="text-2xl font-bold mb-6 text-white/90 flex items-center">
          <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-300 rounded-full mr-3" />
          Game Events
        </h3>
        <div className="space-y-4">
          {gameStats.events.map((event, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden group"
            >
              <div
                className="p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${EVENT_COLORS[event.type].bg}, rgba(0,0,0,0.2))`,
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg flex items-center gap-2" style={{ color: EVENT_COLORS[event.type].text }}>
                    {event.type === 'pitch' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>}
                    {event.type === 'hit' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    {event.type === 'run' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {event.type === 'out' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  <span className="text-sm px-3 py-1 rounded-full bg-black/20 text-white/70 group-hover:bg-black/30 transition-colors">
                    Inning {event.inning} ({event.half})
                  </span>
                </div>
                {event.details && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {Object.entries(event.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center group-hover:bg-black/10 px-2 py-1 rounded transition-colors">
                        <span className="text-sm text-white/60">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-sm font-medium text-white/90">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <AnimatePresence mode="wait">
        {isInitializing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div className="relative w-64 h-2 bg-gray-700/30 rounded-full overflow-hidden mb-6">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full"
                style={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.p 
              className="text-lg text-white/70 text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {loadingProgress < 25 && "Initializing video..."}
              {loadingProgress >= 25 && loadingProgress < 50 && "Analyzing game footage..."}
              {loadingProgress >= 50 && loadingProgress < 75 && "Processing statistics..."}
              {loadingProgress >= 75 && "Finalizing analysis..."}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto"
          >
            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
              <div className="aspect-video bg-gray-900">
                {isYouTubeVideo ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                  >
                    <source src={video.url} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>

            {/* Analysis Content */}
            <div className="space-y-8">
              {/* Game Summary */}
              {narration && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-xl overflow-hidden"
                >
                  <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-300 rounded-full" />
                        <h3 className="text-2xl font-bold text-white/90">Game Analysis</h3>
                      </div>
                      <button
                        onClick={() => setShowChatInput(!showChatInput)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Ask Questions
                      </button>
                    </div>

                    {showChatInput && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6"
                      >
                        <form onSubmit={handleChatSubmit} className="space-y-4">
                          <div className="flex gap-4">
                            <input
                              ref={chatInputRef}
                              type="text"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Ask detailed questions about plays, stats, or strategy..."
                              className="flex-1 px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white/90 placeholder-white/50 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                              type="submit"
                              disabled={!chatMessage.trim()}
                              className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Ask
                            </button>
                          </div>
                        </form>

                        {chatHistory.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 space-y-4 max-h-[400px] overflow-y-auto chat-history pr-2 custom-scrollbar"
                          >
                            {chatHistory.map((chat, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-2"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 px-4 py-2 rounded-lg bg-cyan-500/10 text-white/90">
                                    <p className="font-medium mb-1 text-cyan-400">You</p>
                                    <p>{chat.question}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 px-4 py-2 rounded-lg bg-emerald-500/10 text-white/90">
                                    <p className="font-medium mb-1 text-emerald-400">AI Analyst</p>
                                    <p className="whitespace-pre-line">{chat.answer}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="divide-y divide-white/5">
                    {parseNarrationSections(narration).map((section, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {renderAnalysisSection(section)}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stats and Events */}
              {renderPlayerStats()}
              {renderGameEvents()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoAnalyzer; 