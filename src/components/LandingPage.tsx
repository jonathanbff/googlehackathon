import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Award, ChevronRight, Youtube, AlertTriangle, Globe2, Users, Bell, Zap } from 'lucide-react';
import { searchMLBVideos } from '../services/youtubeService';

// YouTube API response types
interface YouTubeVideoSnippet {
  title: string;
  description: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
  publishedAt: string;
}

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: YouTubeVideoSnippet;
}

interface SearchResponse {
  items: YouTubeVideo[];
}

// Add a type for video structure
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  description: string;
  date: string;
  duration: string;
  category: string;
  tags: string[];
}

// Mock videos with correct YouTube links
const MOCK_VIDEOS = [
  {
    id: 'K8_wE4EGn8Y',
    title: "CC Sabathia's First Shutout w/ the Yankees (8/2/2009)",
    thumbnail: 'https://img.youtube.com/vi/K8_wE4EGn8Y/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=K8_wE4EGn8Y',
    description: "CC Sabathia leads the New York Yankees to a 8/2/2009 shutout victory. Historic start for Sabathia, marking his first complete-game shutout in pinstripes.",
    date: '8/2/2009',
    duration: '2:45:30',
    category: 'Historic Games',
    tags: ['Yankees', 'Shutout', 'Complete Game']
  },
  {
    id: 'OZpQ4q_8Zkk',
    title: "Felix Hernández Perfect Game (8/15/2012)",
    thumbnail: 'https://img.youtube.com/vi/OZpQ4q_8Zkk/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=OZpQ4q_8Zkk',
    description: "Seattle's 'King Félix' Hernández etches his name in history, throwing the first perfect game in Mariners franchise history against the Tampa Bay Rays.",
    date: '8/15/2012',
    duration: '2:38:15',
    category: 'Perfect Games',
    tags: ['Mariners', 'Perfect Game', 'King Felix']
  },
  {
    id: 'dVE1TzDTiH8',
    title: "Ken Griffey Sr. & Ken Griffey Jr. Go Back-to-Back (9/14/1990)",
    thumbnail: 'https://img.youtube.com/vi/dVE1TzDTiH8/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dVE1TzDTiH8',
    description: "An iconic father-son moment: Ken Griffey Sr. and Ken Griffey Jr. hit back-to-back home runs for the Seattle Mariners.",
    date: '9/14/1990',
    duration: '2:52:45',
    category: 'Iconic Moments',
    tags: ['Mariners', 'Home Runs', 'Griffey']
  },
  {
    id: '9L9LJ8bMVUw',
    title: "Cal Ripken Jr. Breaks Lou Gehrig's Streak (9/6/1995)",
    thumbnail: 'https://img.youtube.com/vi/9L9LJ8bMVUw/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=9L9LJ8bMVUw',
    description: "Historic night at Camden Yards: Cal Ripken Jr. plays in his 2,131st consecutive game, surpassing Lou Gehrig's all-time record.",
    date: '9/6/1995',
    duration: '2:41:20',
    category: 'Records',
    tags: ['Orioles', 'Streak', 'Record Breaking']
  },
  {
    id: 'anQ4-snOZAo',
    title: "Roy Halladay Perfect Game (5/29/2010)",
    thumbnail: 'https://img.youtube.com/vi/anQ4-snOZAo/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=anQ4-snOZAo',
    description: "Roy Halladay becomes the 20th pitcher in MLB history to record a perfect game against the Florida Marlins.",
    date: '5/29/2010',
    duration: '2:35:50',
    category: 'Perfect Games',
    tags: ['Phillies', 'Perfect Game', 'Doc Halladay']
  },
  {
    id: 'H0bEBGO9Ld4',
    title: "Game 7 of the 2001 World Series – Diamondbacks vs. Yankees",
    thumbnail: 'https://img.youtube.com/vi/H0bEBGO9Ld4/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=H0bEBGO9Ld4',
    description: "A modern classic: the Arizona Diamondbacks clinch their first World Series title with a dramatic 9th-inning comeback off of the legendary Mariano Rivera.",
    date: '11/4/2001',
    duration: '3:15:20',
    category: 'World Series',
    tags: ['Diamondbacks', 'Yankees', 'World Series', 'Game 7']
  },
  {
    id: '01-F2pP02_4',
    title: "1986 World Series, Game 6 (Red Sox @ Mets)",
    thumbnail: 'https://img.youtube.com/vi/01-F2pP02_4/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=01-F2pP02_4',
    description: "One of the most famous endings in World Series history. Features the Mets' epic 10th-inning rally that forced Game 7, capped by the Bill Buckner misplay at first base.",
    date: '10/27/1986',
    duration: '3:22:15',
    category: 'World Series',
    tags: ['Mets', 'Red Sox', 'World Series', 'Game 6']
  },
  {
    id: 'M4vp4pdYIIw',
    title: "Best Defensive Plays of 2022",
    thumbnail: 'https://img.youtube.com/vi/M4vp4pdYIIw/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=M4vp4pdYIIw',
    description: "A compilation of the most spectacular defensive plays from the 2022 MLB season.",
    date: '12/25/2022',
    duration: '15:30',
    category: 'Highlights',
    tags: ['Defense', '2022', 'Compilation']
  },
  {
    id: 'VgASpMAIV0k',
    title: "Legendary Home Runs",
    thumbnail: 'https://img.youtube.com/vi/VgASpMAIV0k/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=VgASpMAIV0k',
    description: "A collection of the most memorable home runs in baseball history.",
    date: '2023',
    duration: '18:45',
    category: 'Highlights',
    tags: ['Home Runs', 'Compilation', 'Historic']
  }
];

const FEATURED_VIDEO_IDS = ['H0bEBGO9Ld4', '01-F2pP02_4']; // 2001 World Series Game 7 and 1986 World Series Game 6

interface LandingPageProps {
  onVideoSelect: (video: Video) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onVideoSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isApiError, setIsApiError] = useState(false);
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [showLogo, setShowLogo] = useState(true);

  const categories = [
    { id: 'perfect', name: 'Perfect Games', icon: Award, color: 'cyan' },
    { id: 'world-series', name: 'World Series', icon: Award, color: 'yellow' },
    { id: 'historic', name: 'Historic Games', icon: Award, color: 'purple' },
    { id: 'records', name: 'Records', icon: Award, color: 'green' },
    { id: 'iconic', name: 'Iconic Moments', icon: Play, color: 'red' },
    { id: 'highlights', name: 'Highlights', icon: Play, color: 'blue' },
    { id: 'live', name: 'Live Games', icon: Play, color: 'green' },
  ];

  // Function to fetch live/recent games only when necessary
  const fetchLiveGames = async () => {
    setIsLoadingLive(true);
    try {
      const response = await searchMLBVideos('Live Games MLB official') as SearchResponse;
      if (response?.items?.length > 0) {
        // Convert YouTube API response to our Video format
        const formattedLiveGames = response.items.map((game: YouTubeVideo) => ({
          id: game.id.videoId,
          title: game.snippet.title,
          thumbnail: game.snippet.thumbnails.high.url,
          url: `https://www.youtube.com/watch?v=${game.id.videoId}`,
          description: game.snippet.description,
          date: new Date(game.snippet.publishedAt).toLocaleDateString(),
          duration: 'LIVE',
          category: 'Live Games',
          tags: ['Live', 'MLB', 'Official']
        }));
        // Add live games to the beginning of the videos array
        setVideos(prev => [...formattedLiveGames, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching live games:', error);
      setIsApiError(true);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Filter videos based on search and category
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || video.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const featuredVideos = MOCK_VIDEOS.filter(video => FEATURED_VIDEO_IDS.includes(video.id));

  const renderFeaturedSection = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Award className="text-yellow-400" />
        Featured World Series Classics
      </h2>
      {featuredVideos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer relative rounded-xl overflow-hidden shadow-2xl"
              onClick={() => onVideoSelect(video)}
            >
              <div className="aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                      {video.category}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-white/10 text-white/90 text-xs">
                      {video.duration}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                      {video.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {video.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full bg-white/5 text-white/70 text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center text-yellow-400 text-sm font-medium">
                    Watch Analysis
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-8 text-center"
        >
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">
            Featured Content Unavailable
          </h3>
          <p className="text-yellow-400/80 max-w-md mx-auto">
            We're having trouble loading the featured content. Please try refreshing the page or explore our other videos below.
          </p>
        </motion.div>
      )}
    </div>
  );

  // Logo animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Initial Logo Animation */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-900"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="w-24 h-24 rounded-full border-4 border-t-blue-400 border-r-purple-400 border-b-cyan-400 border-l-transparent"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <img src="/logo.png" alt="Baseball AI" className="w-16 h-16" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Your Personal Baseball Highlights AI
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience baseball like never before with AI-powered personalized highlights in your language.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <Globe2 className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Multilingual Support</h3>
                <p className="text-sm text-gray-400">
                  Enjoy highlights and commentary in English, Spanish, and Japanese
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <Users className="w-8 h-8 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Personalized Feed</h3>
                <p className="text-sm text-gray-400">
                  Follow your favorite teams and players for custom highlight reels
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <Bell className="w-8 h-8 text-cyan-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Smart Notifications</h3>
                <p className="text-sm text-gray-400">
                  Get real-time alerts for key moments from your followed content
                </p>
              </motion.div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for games, players, or moments..."
                className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:border-cyan-400 backdrop-blur-sm"
              />
              <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-medium"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm font-medium border border-white/20"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-12"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">3</div>
            <div className="text-sm text-gray-400">Supported Languages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">30+</div>
            <div className="text-sm text-gray-400">MLB Teams</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">1000+</div>
            <div className="text-sm text-gray-400">Games Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">24/7</div>
            <div className="text-sm text-gray-400">Real-time Updates</div>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCategory(category.name);
                // Only fetch live games when selecting the Live Games category
                if (category.name === 'Live Games' && !isApiError) {
                  fetchLiveGames();
                }
              }}
              className={`p-4 rounded-xl border ${
                selectedCategory === category.name
                  ? `border-${category.color}-400 bg-${category.color}-400/10`
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              } backdrop-blur-sm transition-all duration-300`}
            >
              {isLoadingLive && category.name === 'Live Games' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2" />
              ) : (
                <category.icon className={`w-6 h-6 mb-2 ${
                  selectedCategory === category.name ? `text-${category.color}-400` : 'text-gray-400'
                }`} />
              )}
              <span className="text-sm font-medium">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* API Error Notice */}
      {isApiError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertTriangle className="text-yellow-500" />
            <p className="text-yellow-500">
              Live content is currently unavailable. Showing archived games instead.
            </p>
          </motion.div>
        </div>
      )}

      {/* Featured Section */}
      {renderFeaturedSection()}

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-2xl font-bold mb-6">
          {selectedCategory || 'All Games'}
          {isLoadingLive && selectedCategory === 'Live Games' && (
            <span className="ml-2 text-sm text-gray-400">Loading live games...</span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => onVideoSelect(video)}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-sm">
                  {video.duration}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2">{video.date}</p>
              <p className="text-sm text-gray-300 line-clamp-2">{video.description}</p>
              <div className="mt-4 flex items-center text-cyan-400 text-sm font-medium">
                Watch Analysis
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 