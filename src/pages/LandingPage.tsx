import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Filter, Play, Loader2, Award, ChevronRight, Youtube, AlertTriangle, Globe2, Users, Bell, Upload, Cpu, Brain, Sparkles, Languages } from 'lucide-react';
import GameCard from '../components/GameCard';
import { searchMLBVideos, formatGameTitle, YouTubeVideo } from '../services/youtubeService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const categories = [
  'Featured',
  'Perfect Games',
  'World Series',
  'Historic Games',
  'Records',
  'Iconic Moments',
  'Highlights',
  'Live Games'
] as const;

type Category = typeof categories[number];

interface CategoryButton {
  id: string;
  name: Category;
  icon: React.FC<{ className?: string }>;
  color: string;
}

const categoryButtons: CategoryButton[] = [
  { id: 'featured', name: 'Featured', icon: Award, color: 'cyan' },
  { id: 'perfect', name: 'Perfect Games', icon: Award, color: 'yellow' },
  { id: 'world-series', name: 'World Series', icon: Award, color: 'purple' },
  { id: 'historic', name: 'Historic Games', icon: Play, color: 'green' },
  { id: 'records', name: 'Records', icon: Award, color: 'red' },
  { id: 'iconic', name: 'Iconic Moments', icon: Play, color: 'blue' },
  { id: 'highlights', name: 'Highlights', icon: Play, color: 'orange' },
  { id: 'live', name: 'Live Games', icon: Play, color: 'green' }
];

interface MockVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  description: string;
  date: string;
  duration: string;
  category: Category;
  tags: string[];
}

const MOCK_VIDEOS: MockVideo[] = [
  {
    id: 'H0bEBGO9Ld4',
    title: "Game 7 of the 2001 World Series – Diamondbacks vs. Yankees",
    thumbnail: 'https://img.youtube.com/vi/H0bEBGO9Ld4/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=H0bEBGO9Ld4',
    description: "A modern classic: the Arizona Diamondbacks clinch their first World Series title with a dramatic 9th-inning comeback.",
    date: '11/4/2001',
    duration: '3:15:20',
    category: 'World Series',
    tags: ['Diamondbacks', 'Yankees', 'World Series', 'Game 7']
  },
  {
    id: 'OZpQ4q_8Zkk',
    title: "Felix Hernández Perfect Game (8/15/2012)",
    thumbnail: 'https://img.youtube.com/vi/OZpQ4q_8Zkk/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=OZpQ4q_8Zkk',
    description: "King Félix throws the first perfect game in Mariners franchise history.",
    date: '8/15/2012',
    duration: '2:38:15',
    category: 'Perfect Games',
    tags: ['Mariners', 'Perfect Game', 'King Felix']
  },
  {
    id: '01-F2pP02_4',
    title: "1986 World Series, Game 6 (Red Sox @ Mets)",
    thumbnail: 'https://img.youtube.com/vi/01-F2pP02_4/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=01-F2pP02_4',
    description: "One of the most famous endings in World Series history, featuring the Mets' epic 10th-inning rally.",
    date: '10/27/1986',
    duration: '3:22:15',
    category: 'World Series',
    tags: ['Mets', 'Red Sox', 'World Series', 'Game 6']
  },
  {
    id: 'dVE1TzDTiH8',
    title: "Ken Griffey Sr. & Jr. Go Back-to-Back (9/14/1990)",
    thumbnail: 'https://img.youtube.com/vi/dVE1TzDTiH8/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dVE1TzDTiH8',
    description: "An iconic father-son moment as they hit back-to-back home runs.",
    date: '9/14/1990',
    duration: '2:52:45',
    category: 'Iconic Moments',
    tags: ['Mariners', 'Home Runs', 'Griffey']
  },
  {
    id: '9L9LJ8bMVUw',
    title: "Cal Ripken Jr. Breaks Lou Gehrig's Streak",
    thumbnail: 'https://img.youtube.com/vi/9L9LJ8bMVUw/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=9L9LJ8bMVUw',
    description: "Cal Ripken Jr. plays in his 2,131st consecutive game.",
    date: '9/6/1995',
    duration: '2:41:20',
    category: 'Records',
    tags: ['Orioles', 'Streak', 'Record Breaking']
  }
] as const;

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Featured');
  const [error, setError] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState(true);
  const navigate = useNavigate();

  const trendingSearches = [
    'Seoul Series',
    'MLB Classics',
    'World Series',
    'Historic Games',
    'Opening Day',
    'Full Games',
    'Best Moments'
  ];

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchTerm = selectedCategory === 'Featured' ? 'full game 2024' : selectedCategory;
      const response = await searchMLBVideos(searchTerm, 4);
      setVideos(response.items);
    } catch (err) {
      setError('Failed to load videos. Please try again later.');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await searchMLBVideos(searchQuery, 4);
      setVideos(response.items);
    } catch (err) {
      setError('Failed to search videos. Please try again later.');
      console.error('Error searching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const videoToGameCard = (video: YouTubeVideo) => {
    const { homeTeam, awayTeam } = formatGameTitle(video.snippet.title);
    return {
      homeTeam,
      awayTeam,
      status: 'finished' as const,
      timestamp: new Date(video.snippet.publishedAt).toLocaleDateString(),
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      youtubeId: video.id.videoId,
    };
  };

  // Handle video selection
  const handleVideoSelect = (video: YouTubeVideo) => {
    navigate(`/analysis?videoId=${video.id.videoId}`);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const AnimatedBaseballIcon = () => (
    <motion.div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 rounded-full bg-[#00FFC2]/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-[#00FFC2] rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute top-0 left-1/2 w-2 h-2 bg-[#00FFC2] rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-2 bg-[#00FFC2] rounded-full"
        animate={{
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );

  const getFilteredVideos = () => {
    if (error || !videos.length) {
      // Use mock videos when API fails or no videos are loaded
      return MOCK_VIDEOS.filter(video => {
        const matchesSearch = searchQuery.toLowerCase() === '' || 
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'Featured' || 
          video.category === selectedCategory;

        return matchesSearch && matchesCategory;
      });
    }
    return videos;
  };

  const renderVideoCard = (video: MockVideo | YouTubeVideo) => {
    const isYouTubeVideo = 'snippet' in video;
    const videoData = isYouTubeVideo ? {
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      description: video.snippet.description,
      date: new Date(video.snippet.publishedAt).toLocaleDateString(),
      duration: 'Live',
      tags: ['Live']
    } : video;

    return (
      <motion.div
        key={videoData.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="group cursor-pointer rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
        onClick={() => navigate(`/analysis?videoId=${videoData.id}`)}
      >
        <div className="aspect-video relative">
          <img
            src={videoData.thumbnail}
            alt={videoData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-black/60 text-sm">
            {videoData.duration}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00FFC2] transition-colors">
            {videoData.title}
          </h3>
          <p className="text-sm text-gray-400 mb-2">{videoData.date}</p>
          <p className="text-sm text-gray-300 line-clamp-2 mb-4">
            {videoData.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {videoData.tags.map((tag: string, index: number) => (
              <span
                key={`${videoData.id}-${index}`}
                className="px-2 py-1 rounded-full text-xs bg-white/10 text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00FFC2]"></div>
                <span className="text-xl font-bold">HighlightIQ</span>
              </a>
              <div className="hidden md:flex items-center gap-6">
                <a href="/" className="text-gray-300 hover:text-[#00FFC2] transition-colors">
                  {t('navigation.home')}
                </a>
                <a href="/analysis" className="text-gray-300 hover:text-[#00FFC2] transition-colors">
                  {t('navigation.liveAnalysis')}
                </a>
                <a href="/stats" className="text-gray-300 hover:text-[#00FFC2] transition-colors">
                  {t('navigation.stats')}
                </a>
                <a href="/players" className="text-gray-300 hover:text-[#00FFC2] transition-colors">
                  {t('navigation.players')}
                </a>
                <a href="/settings" className="text-gray-300 hover:text-[#00FFC2] transition-colors">
                  {t('navigation.settings')}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Language buttons moved to hero section */}
              <button className="px-4 py-2 rounded-lg bg-[#00FFC2] text-gray-900 font-bold hover:bg-[#00FFC2]/90 transition-colors">
                {t('auth.signIn')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Logo Animation */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1A2F]"
          >
            <div className="relative flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative flex items-center gap-4"
              >
                <AnimatedBaseballIcon />
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#00FFC2] to-blue-400 bg-clip-text text-transparent">
                    HighlightIQ
                  </span>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-3 text-sm text-gray-400"
              >
                AI-Powered Baseball Analysis
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00FFC2] to-blue-400">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>

            {/* Language Support Banner - Now Functional */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg backdrop-blur-sm border ${
                  i18n.language === 'en' 
                    ? 'bg-[#00FFC2]/20 border-[#00FFC2]' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className={i18n.language === 'en' ? 'text-[#00FFC2]' : 'text-gray-400'}>
                  English
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleLanguageChange('es')}
                className={`px-4 py-2 rounded-lg backdrop-blur-sm border ${
                  i18n.language === 'es' 
                    ? 'bg-[#00FFC2]/20 border-[#00FFC2]' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className={i18n.language === 'es' ? 'text-[#00FFC2]' : 'text-gray-400'}>
                  Español
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleLanguageChange('ja')}
                className={`px-4 py-2 rounded-lg backdrop-blur-sm border ${
                  i18n.language === 'ja' 
                    ? 'bg-[#00FFC2]/20 border-[#00FFC2]' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className={i18n.language === 'ja' ? 'text-[#00FFC2]' : 'text-gray-400'}>
                  日本語
                </span>
              </motion.button>
            </div>

            {/* Featured Video Section */}
            <div className="relative rounded-xl overflow-hidden mb-12 max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <img 
                src="https://img.youtube.com/vi/8r0iChPkggs/maxresdefault.jpg"
                alt="Seoul Series 2024"
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-left">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-600 text-white text-sm font-bold mb-3">
                  Featured Game
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  2024 Seoul Series: Dodgers vs. Padres
                </h2>
                <p className="text-gray-200 mb-4">
                  Watch the full game of MLB's historic season opener in Seoul, Korea
                </p>
                <div className="flex gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/analysis?videoId=8r0iChPkggs')}
                    className="inline-flex items-center gap-2 bg-[#00FFC2] text-[#0A1A2F] px-6 py-3 rounded-lg font-bold hover:bg-[#00FFC2]/90 transition-all"
                  >
                    <Play className="w-5 h-5" />
                    Watch Analysis
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('https://www.youtube.com/watch?v=8r0iChPkggs', '_blank')}
                    className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/20 transition-all backdrop-blur-sm"
                  >
                    <Youtube className="w-5 h-5" />
                    Watch on YouTube
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Technology Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <Brain className="w-8 h-8 text-[#00FFC2] mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">{t('tech.aiAnalysis.title')}</h3>
                <p className="text-sm text-gray-400">
                  {t('tech.aiAnalysis.description')}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <Languages className="w-8 h-8 text-[#00FFC2] mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">{t('tech.neuralTranslation.title')}</h3>
                <p className="text-sm text-gray-400">
                  {t('tech.neuralTranslation.description')}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <Cpu className="w-8 h-8 text-[#00FFC2] mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">{t('tech.realtime.title')}</h3>
                <p className="text-sm text-gray-400">
                  {t('tech.realtime.description')}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <Sparkles className="w-8 h-8 text-[#00FFC2] mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">{t('tech.personalization.title')}</h3>
                <p className="text-sm text-gray-400">
                  {t('tech.personalization.description')}
                </p>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/analysis')}
                className="px-8 py-4 rounded-lg bg-[#00FFC2] text-gray-900 font-bold text-lg hover:bg-[#00FFC2]/90 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {t('hero.startWatching')}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/analysis')}
                className="px-8 py-4 rounded-lg bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20"
              >
                <Upload className="w-5 h-5" />
                {t('hero.liveAnalysis')}
              </motion.button>
            </div>

            {/* Search Section */}
            <div className="relative max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00FFC2] focus:ring-1 focus:ring-[#00FFC2] focus:outline-none backdrop-blur-sm text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#00FFC2] text-gray-900 rounded-lg hover:bg-[#00FFC2]/90 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* Trending Searches */}
              <div className="mt-4 flex items-center justify-center flex-wrap gap-2">
                <span className="text-sm text-gray-400">{t('search.trending')}:</span>
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch(new Event('submit') as any);
                    }}
                    className="px-3 py-1 rounded-full text-sm bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryButtons.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCategory(category.name);
                  if (category.name === 'Live Games') {
                    fetchVideos();
                  }
                }}
                className={`p-4 rounded-xl border ${
                  selectedCategory === category.name
                    ? `border-${category.color}-400 bg-${category.color}-400/10`
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                } backdrop-blur-sm transition-all duration-300`}
              >
                <category.icon className={`w-6 h-6 mb-2 ${
                  selectedCategory === category.name ? `text-${category.color}-400` : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory}
            {loading && (
              <span className="ml-2 text-sm text-gray-400">Loading...</span>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredVideos().map((video) => renderVideoCard(video))}
          </div>
        </div>

        {/* MLB Official Channel Link */}
        <div className="mt-12 text-center p-6 bg-gray-800/50 rounded-xl">
          <h3 className="text-xl font-bold mb-3">{t('mlb.title')}</h3>
          <p className="text-gray-400 mb-4">
            {t('mlb.description')}
          </p>
          <a 
            href="https://www.youtube.com/user/MLB"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all"
          >
            {t('mlb.button')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;