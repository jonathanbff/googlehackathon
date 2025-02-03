import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, Play, Loader2 } from 'lucide-react';
import GameCard from '../components/GameCard';
import { searchMLBVideos, formatGameTitle, YouTubeVideo } from '../services/youtubeService';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Featured');
  const [error, setError] = useState<string | null>(null);

  const trendingSearches = [
    'Seoul Series',
    'MLB Classics',
    'World Series',
    'Historic Games',
    'Opening Day',
    'Full Games',
    'Best Moments'
  ];

  const categories = [
    'Featured',
    'Live Games',
    'Full Games',
    'Classics',
    'Historic',
    'Opening Day',
    'Highlights',
    'International'
  ];

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          MLB's Greatest Games Collection
        </h1>
        <p className="text-gray-400 text-xl mb-8">
          Watch full games, classics, and historic moments from MLB's official archive
        </p>

        {/* Featured Banner - Seoul Series */}
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
            <button 
              onClick={() => window.open(`https://www.youtube.com/watch?v=8r0iChPkggs`, '_blank')}
              className="inline-flex items-center gap-2 bg-[#00FFC2] text-[#0A1A2F] px-6 py-3 rounded-lg font-bold hover:bg-[#00FFC2]/90 transition-all"
            >
              <Play className="w-5 h-5" />
              Watch Full Game
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for games, players, teams, or highlights..."
              className="w-full px-6 py-4 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-[#00FFC2] focus:ring-1 focus:ring-[#00FFC2] focus:outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button type="submit" className="bg-[#00FFC2] text-[#0A1A2F] p-2 rounded-lg">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        {/* Trending Searches */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-2">
          <span className="text-gray-400">Trending:</span>
          {trendingSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                handleSearch(new Event('submit') as any);
              }}
              className="px-3 py-1 rounded-full text-sm bg-gray-800/50 hover:bg-gray-700 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#00FFC2] text-[#0A1A2F]'
                    : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Game Cards Grid */}
        {error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00FFC2]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <GameCard key={video.id.videoId} {...videoToGameCard(video)} />
            ))}
          </div>
        )}

        {/* MLB Official Channel Link */}
        <div className="mt-12 text-center p-6 bg-gray-800/50 rounded-xl">
          <h3 className="text-xl font-bold mb-3">Want More Baseball?</h3>
          <p className="text-gray-400 mb-4">
            Visit MLB's Official YouTube Channel for more highlights, classic games, and exclusive content
          </p>
          <a 
            href="https://www.youtube.com/user/MLB"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all"
          >
            Visit MLB Channel
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;