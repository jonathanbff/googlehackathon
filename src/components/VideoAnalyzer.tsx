import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Pause, Camera, SkipBack, SkipForward, RefreshCw } from 'lucide-react';
import { analyzeFrame, extractGameEvents, extractPlayerMetrics } from '../services/visionService';
import { GameEvent, PlayerMetric } from '../types/game';

interface VideoAnalyzerProps {
  onEventsDetected: (events: GameEvent[]) => void;
  onMetricsDetected: (metrics: PlayerMetric[]) => void;
}

// Mock data for testing
const MOCK_EVENTS: GameEvent[] = [
  {
    type: 'pitch',
    description: 'Fastball, 95mph',
    timestamp: new Date().toISOString(),
    confidence: 0.95,
  },
  {
    type: 'hit',
    description: 'Line drive to center field',
    timestamp: new Date().toISOString(),
    confidence: 0.88,
  },
  {
    type: 'run',
    description: 'Runner advancing to second base',
    timestamp: new Date().toISOString(),
    confidence: 0.92,
  },
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

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  onEventsDetected,
  onMetricsDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analysisInterval, setAnalysisInterval] = useState<number | null>(null);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, [analysisInterval]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        videoRef.current.onloadedmetadata = () => {
          setDuration(videoRef.current?.duration || 0);
        };
      }
    }
  };

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
    if (!videoFile || isAnalyzing) return;

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
          onEventsDetected(newEvents as GameEvent[]);
          onMetricsDetected(newMetrics);
        }
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden">
      <div className="aspect-video relative">
        {!videoFile ? (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-colors">
            <Upload className="w-12 h-12 mb-2 text-[#00FFC2]" />
            <span className="text-gray-300">Upload MP4 Video</span>
            <input
              type="file"
              accept="video/mp4"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full mb-4 accent-[#00FFC2]"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={skipBackward}
                    className="text-white hover:text-[#00FFC2] transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="bg-[#00FFC2] text-[#0A1A2F] p-2 rounded-lg hover:bg-[#00FFC2]/90 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={skipForward}
                    className="text-white hover:text-[#00FFC2] transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAutoAnalyze}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      autoAnalyze
                        ? 'bg-[#00FFC2] text-[#0A1A2F]'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${autoAnalyze ? 'animate-spin' : ''}`} />
                    Auto Analyze
                  </button>
                  
                  <button
                    onClick={analyzeCurrentFrame}
                    disabled={isAnalyzing}
                    className={`flex items-center gap-2 bg-[#00FFC2] text-[#0A1A2F] px-4 py-2 rounded-lg transition-colors ${
                      isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00FFC2]/90'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Frame'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VideoAnalyzer; 