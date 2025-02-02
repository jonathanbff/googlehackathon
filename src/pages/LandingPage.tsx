import React, { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import GameCard from '../components/GameCard';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const trendingSearches = [
    'live games',
    'mlb highlights',
    'player stats',
    'world series',
    'top plays',
    'home runs',
    'pitching analysis'
  ];

  const categories = [
    'Popular',
    'Live Games',
    'Highlights',
    'Statistics',
    'Teams',
    'Players',
    'Analysis',
    'Historical'
  ];

  const sampleGames: Array<React.ComponentProps<typeof GameCard>> = [
    {
      homeTeam: 'Yankees',
      awayTeam: 'Red Sox',
      score: { home: 5, away: 3 },
      status: 'live' as const,
      timestamp: 'Live - 7th Inning',
      thumbnailUrl: 'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&w=800&q=80'
    },
    {
      homeTeam: 'Dodgers',
      awayTeam: 'Giants',
      score: { home: 2, away: 2 },
      status: 'live' as const,
      timestamp: 'Live - 5th Inning',
      thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80'
    },
    {
      homeTeam: 'Cubs',
      awayTeam: 'Cardinals',
      status: 'upcoming' as const,
      timestamp: 'Today, 7:05 PM ET',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584285405429-136bf988919c?auto=format&fit=crop&w=800&q=80'
    },
    {
      homeTeam: 'Mets',
      awayTeam: 'Braves',
      score: { home: 4, away: 6 },
      status: 'finished' as const,
      timestamp: 'Final',
      thumbnailUrl: 'https://images.unsplash.com/photo-1569076874277-170a9a4a4ae7?auto=format&fit=crop&w=800&q=80'
    },
    {
      homeTeam: 'Astros',
      awayTeam: 'Rangers',
      score: { home: 1, away: 3 },
      status: 'live' as const,
      timestamp: 'Live - 3rd Inning',
      thumbnailUrl: 'https://images.unsplash.com/photo-1471295253337-3ceaaad65897?auto=format&fit=crop&w=800&q=80'
    },
    {
      homeTeam: 'Blue Jays',
      awayTeam: 'Orioles',
      status: 'upcoming' as const,
      timestamp: 'Tomorrow, 1:05 PM ET',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Discover Baseball's Finest Moments
        </h1>
        <p className="text-gray-400 text-xl mb-8">
          Explore live games, highlights, and in-depth analysis from the world of baseball
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for games, players, teams, or highlights..."
              className="w-full px-6 py-4 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-[#00FFC2] focus:ring-1 focus:ring-[#00FFC2] focus:outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button className="px-4 py-2 text-gray-400 hover:text-white flex items-center space-x-1">
                <span>Games</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="bg-[#00FFC2] text-[#0A1A2F] p-2 rounded-lg">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trending Searches */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-2">
          <span className="text-gray-400">Trending:</span>
          {trendingSearches.map((term) => (
            <button
              key={term}
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
                className="px-4 py-2 rounded-lg text-sm whitespace-nowrap hover:bg-gray-800 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleGames.map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;