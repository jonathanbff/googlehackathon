import React, { useState } from 'react';
import { 
  ChevronDown, Search, Filter, Trophy, Target, Activity,
  Calendar, Newspaper, TrendingUp, BarChart2, Users, 
  ArrowRight, Star, Clock, Bell
} from 'lucide-react';
import { GiBaseballBat } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';

interface StatCard {
  rank: number;
  player: {
    name: string;
    team: string;
    image: string;
  };
  value: string | number;
}

interface TeamRankingItem {
  name: string;
  record?: string;
  value?: string;
  trend: string;
}

interface TeamRanking {
  category: string;
  teams: TeamRankingItem[];
}

// Mock data for baseball stats
const BATTING_STATS: StatCard[] = [
  {
    rank: 1,
    player: {
      name: "Shohei Ohtani",
      team: "LA Dodgers",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/660271/headshot/67/current"
    },
    value: ".304"
  },
  {
    rank: 2,
    player: {
      name: "Juan Soto",
      team: "NY Yankees",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/665742/headshot/67/current"
    },
    value: ".297"
  },
  {
    rank: 3,
    player: {
      name: "Mookie Betts",
      team: "LA Dodgers",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/605141/headshot/67/current"
    },
    value: ".295"
  }
];

const HOME_RUNS: StatCard[] = [
  {
    rank: 1,
    player: {
      name: "Aaron Judge",
      team: "NY Yankees",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/592450/headshot/67/current"
    },
    value: 35
  },
  {
    rank: 2,
    player: {
      name: "Matt Olson",
      team: "Atlanta Braves",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/621566/headshot/67/current"
    },
    value: 33
  },
  {
    rank: 3,
    player: {
      name: "Pete Alonso",
      team: "NY Mets",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/624413/headshot/67/current"
    },
    value: 31
  }
];

const PITCHING_STATS: StatCard[] = [
  {
    rank: 1,
    player: {
      name: "Gerrit Cole",
      team: "NY Yankees",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/543037/headshot/67/current"
    },
    value: "2.63"
  },
  {
    rank: 2,
    player: {
      name: "Spencer Strider",
      team: "Atlanta Braves",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/675911/headshot/67/current"
    },
    value: "2.87"
  },
  {
    rank: 3,
    player: {
      name: "Zac Gallen",
      team: "Arizona D-backs",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/668678/headshot/67/current"
    },
    value: "3.12"
  }
];

const STRIKEOUTS: StatCard[] = [
  {
    rank: 1,
    player: {
      name: "Spencer Strider",
      team: "Atlanta Braves",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/675911/headshot/67/current"
    },
    value: 281
  },
  {
    rank: 2,
    player: {
      name: "Kevin Gausman",
      team: "Toronto Blue Jays",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/592332/headshot/67/current"
    },
    value: 237
  },
  {
    rank: 3,
    player: {
      name: "Gerrit Cole",
      team: "NY Yankees",
      image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/543037/headshot/67/current"
    },
    value: 222
  }
];

// League Leaders Data
const BATTING_LEADERS = [
  {
    category: "Batting Average",
    players: [
      { name: "Ronald Acuña Jr.", team: "ATL", value: ".337", trend: "+2.1" },
      { name: "Freddie Freeman", team: "LAD", value: ".331", trend: "-0.5" },
      { name: "Luis Arraez", team: "MIA", value: ".329", trend: "+1.2" }
    ]
  },
  {
    category: "Home Runs",
    players: [
      { name: "Matt Olson", team: "ATL", value: "54", trend: "+3" },
      { name: "Pete Alonso", team: "NYM", value: "46", trend: "+1" },
      { name: "Kyle Schwarber", team: "PHI", value: "45", trend: "+2" }
    ]
  },
  {
    category: "RBI",
    players: [
      { name: "Matt Olson", team: "ATL", value: "139", trend: "+4" },
      { name: "Freddie Freeman", team: "LAD", value: "124", trend: "+2" },
      { name: "Juan Soto", team: "SD", value: "118", trend: "+3" }
    ]
  }
];

const PITCHING_LEADERS = [
  {
    category: "ERA",
    players: [
      { name: "Blake Snell", team: "SD", value: "2.25", trend: "-0.12" },
      { name: "Justin Steele", team: "CHC", value: "2.43", trend: "-0.08" },
      { name: "Zac Gallen", team: "ARI", value: "2.46", trend: "+0.15" }
    ]
  },
  {
    category: "Strikeouts",
    players: [
      { name: "Spencer Strider", team: "ATL", value: "281", trend: "+12" },
      { name: "Kevin Gausman", team: "TOR", value: "237", trend: "+8" },
      { name: "Pablo López", team: "MIN", value: "234", trend: "+6" }
    ]
  },
  {
    category: "Wins",
    players: [
      { name: "Zac Gallen", team: "ARI", value: "17", trend: "+1" },
      { name: "Kyle Bradish", team: "BAL", value: "16", trend: "+1" },
      { name: "Logan Webb", team: "SF", value: "16", trend: "0" }
    ]
  }
];

// Upcoming Games
const UPCOMING_GAMES = [
  {
    date: "2024-03-28",
    time: "1:05 PM ET",
    teams: { away: "NYY", home: "HOU" },
    pitchers: { away: "Gerrit Cole", home: "Justin Verlander" },
    venue: "Minute Maid Park"
  },
  {
    date: "2024-03-28",
    time: "4:10 PM ET",
    teams: { away: "LAD", home: "SD" },
    pitchers: { away: "Yoshinobu Yamamoto", home: "Yu Darvish" },
    venue: "Petco Park"
  },
  {
    date: "2024-03-28",
    time: "7:08 PM ET",
    teams: { away: "BOS", home: "SEA" },
    pitchers: { away: "Brayan Bello", home: "Logan Gilbert" },
    venue: "T-Mobile Park"
  }
];

// Latest News
const LATEST_NEWS = [
  {
    title: "Yamamoto Dazzles in Spring Training Debut",
    date: "2024-03-25",
    summary: "Dodgers' $325M signing strikes out 9 in 5 perfect innings",
    category: "Spring Training"
  },
  {
    title: "Judge Ready for Opening Day After Recovery",
    date: "2024-03-24",
    summary: "Yankees' slugger shows power in final exhibition games",
    category: "Injury Updates"
  },
  {
    title: "MLB Announces Rule Changes for 2024",
    date: "2024-03-23",
    summary: "New pitch clock adjustments and defensive positioning rules",
    category: "League News"
  }
];

// Team Rankings
const TEAM_RANKINGS: TeamRanking[] = [
  {
    category: "Overall",
    teams: [
      { name: "Atlanta Braves", record: "104-58", trend: "1" },
      { name: "Los Angeles Dodgers", record: "100-62", trend: "2" },
      { name: "Baltimore Orioles", record: "101-61", trend: "-1" }
    ]
  },
  {
    category: "Run Differential",
    teams: [
      { name: "Atlanta Braves", value: "+231", trend: "0" },
      { name: "Los Angeles Dodgers", value: "+207", trend: "+1" },
      { name: "Tampa Bay Rays", value: "+195", trend: "-1" }
    ]
  }
];

const StatLeaderCard = ({ category, players }: { category: string, players: any[] }) => (
  <div className="bg-gray-800/50 rounded-xl p-6">
    <h3 className="text-xl font-bold mb-4">{category}</h3>
    <div className="space-y-4">
      {players.map((player, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-400">{index + 1}</span>
            <div>
              <div className="font-bold">{player.name}</div>
              <div className="text-sm text-gray-400">{player.team}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{player.value}</span>
            {player.trend && (
              <span className={`text-sm ${
                player.trend.startsWith('+') ? 'text-green-400' : 
                player.trend.startsWith('-') ? 'text-red-400' : 'text-gray-400'
              }`}>
                {player.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NewsCard = ({ news }: { news: typeof LATEST_NEWS[0] }) => (
  <div className="bg-gray-800/50 rounded-xl p-6">
    <div className="flex items-center gap-2 text-sm text-[#00FFC2] mb-2">
      <Bell className="w-4 h-4" />
      {news.category}
    </div>
    <h3 className="text-lg font-bold mb-2">{news.title}</h3>
    <p className="text-gray-400 text-sm mb-3">{news.summary}</p>
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{news.date}</span>
      <button className="text-[#00FFC2] hover:underline flex items-center gap-1">
        Read More <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const GameCard = ({ game }: { game: typeof UPCOMING_GAMES[0] }) => (
  <div className="bg-gray-800/50 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#00FFC2]" />
        <span className="text-sm text-gray-400">{game.time}</span>
      </div>
      <span className="text-sm text-gray-400">{game.date}</span>
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className="text-xl font-bold">{game.teams.away}</div>
      <div className="text-sm text-gray-400">@</div>
      <div className="text-xl font-bold">{game.teams.home}</div>
    </div>
    <div className="text-sm text-gray-400 mb-2">Probable Pitchers:</div>
    <div className="flex justify-between text-sm mb-3">
      <div>{game.pitchers.away}</div>
      <div>{game.pitchers.home}</div>
    </div>
    <div className="text-sm text-gray-400">{game.venue}</div>
  </div>
);

const PlayerStats = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('batting');
  const [selectedView, setSelectedView] = useState('leaders');

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <GiBaseballBat className="w-8 h-8 text-[#00FFC2]" />
            MLB Stats Central
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players, teams..."
                className="bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00FFC2] text-sm w-64"
              />
            </div>
            <button className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedView('leaders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'leaders'
                ? 'bg-[#00FFC2] text-[#0A1A2F]'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Trophy className="w-4 h-4" />
            League Leaders
          </button>
          <button
            onClick={() => setSelectedView('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'teams'
                ? 'bg-[#00FFC2] text-[#0A1A2F]'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Rankings
          </button>
          <button
            onClick={() => setSelectedView('news')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'news'
                ? 'bg-[#00FFC2] text-[#0A1A2F]'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Latest News
          </button>
          <button
            onClick={() => setSelectedView('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'games'
                ? 'bg-[#00FFC2] text-[#0A1A2F]'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Upcoming Games
          </button>
        </div>

        {selectedView === 'leaders' && (
          <>
            {/* Category Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedCategory('batting')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'batting'
                    ? 'bg-[#00FFC2] text-[#0A1A2F]'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Target className="w-4 h-4" />
                Batting Leaders
              </button>
              <button
                onClick={() => setSelectedCategory('pitching')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'pitching'
                    ? 'bg-[#00FFC2] text-[#0A1A2F]'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                Pitching Leaders
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory === 'batting'
                ? BATTING_LEADERS.map((category, index) => (
                    <StatLeaderCard key={index} {...category} />
                  ))
                : PITCHING_LEADERS.map((category, index) => (
                    <StatLeaderCard key={index} {...category} />
                  ))
              }
            </div>
          </>
        )}

        {selectedView === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_RANKINGS.map((ranking, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">{ranking.category}</h3>
                <div className="space-y-4">
                  {ranking.teams.map((team, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">{idx + 1}</span>
                        <div className="font-bold">{team.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{team.record ?? team.value}</span>
                        {team.trend && (
                          <span className={`text-sm ${
                            Number(team.trend) > 0 ? 'text-green-400' : 
                            Number(team.trend) < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {Number(team.trend) > 0 ? '↑' : Number(team.trend) < 0 ? '↓' : '–'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === 'news' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LATEST_NEWS.map((news, index) => (
              <NewsCard key={index} news={news} />
            ))}
          </div>
        )}

        {selectedView === 'games' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {UPCOMING_GAMES.map((game, index) => (
              <GameCard key={index} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStats; 