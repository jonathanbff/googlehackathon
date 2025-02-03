import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Search, Filter, Trophy, Target, Activity,
  Calendar, Newspaper, TrendingUp, BarChart2, Users, 
  ArrowRight, Star, Clock, Bell, User
} from 'lucide-react';
import { GiBaseballBat } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';

interface PlayerStat {
  rank: number;
  player: {
    name: string;
    team: string;
    image: string;
  };
  value: string | number;
  additionalStats?: {
    [key: string]: string | number;
  };
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

interface PlayerStats {
  name: string;
  team: string;
  atBats: number;
  hits: number;
  homeRuns: number;
  singles: number;
  doubles: number;
  triples: number;
  plateAppearances: number;
  strikeouts: number;
  walks: number;
  hitByPitch: number;
  sacrifices: number;
  totalBases: number;
  rbi: number;
  runs: number;
  stolenBases: number;
  caughtStealing: number;
  groundOuts: number;
  flyOuts: number;
  hardHitBalls: number;
  totalPitchesSeen: number;
  // Calculated stats
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  iso?: number;
  babip?: string;
  bbRate?: string;
  kRate?: string;
  gbFbRatio?: string;
  hardHitRate?: string;
}

interface StatsAccumulator {
  [key: string]: PlayerStats;
}

interface LeaderCategory {
  category: string;
  players: PlayerStat[];
}

// Mock data for baseball stats
const BATTING_STATS: PlayerStat[] = [
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

const HOME_RUNS: PlayerStat[] = [
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

const PITCHING_STATS: PlayerStat[] = [
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

const STRIKEOUTS: PlayerStat[] = [
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
const BATTING_LEADERS: LeaderCategory[] = [
  {
    category: "Batting Average",
    players: [
      { 
        rank: 1,
        player: {
          name: "Ronald Acuña Jr.",
          team: "ATL",
          image: ""
        },
        value: ".337",
        additionalStats: { trend: "+2.1" }
      },
      {
        rank: 2,
        player: {
          name: "Freddie Freeman",
          team: "LAD",
          image: ""
        },
        value: ".331",
        additionalStats: { trend: "-0.5" }
      },
      {
        rank: 3,
        player: {
          name: "Luis Arraez",
          team: "MIA",
          image: ""
        },
        value: ".329",
        additionalStats: { trend: "+1.2" }
      }
    ]
  },
  {
    category: "Home Runs",
    players: [
      {
        rank: 1,
        player: {
          name: "Matt Olson",
          team: "ATL",
          image: ""
        },
        value: 54,
        additionalStats: { trend: "+3" }
      },
      {
        rank: 2,
        player: {
          name: "Pete Alonso",
          team: "NYM",
          image: ""
        },
        value: 46,
        additionalStats: { trend: "+1" }
      },
      {
        rank: 3,
        player: {
          name: "Kyle Schwarber",
          team: "PHI",
          image: ""
        },
        value: 45,
        additionalStats: { trend: "+2" }
      }
    ]
  }
];

const PITCHING_LEADERS: LeaderCategory[] = [
  {
    category: "ERA",
    players: [
      {
        rank: 1,
        player: {
          name: "Blake Snell",
          team: "SD",
          image: ""
        },
        value: "2.25",
        additionalStats: { trend: "-0.12" }
      },
      {
        rank: 2,
        player: {
          name: "Justin Steele",
          team: "CHC",
          image: ""
        },
        value: "2.43",
        additionalStats: { trend: "-0.08" }
      },
      {
        rank: 3,
        player: {
          name: "Zac Gallen",
          team: "ARI",
          image: ""
        },
        value: "2.46",
        additionalStats: { trend: "+0.15" }
      }
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

const API_BASE_URL = 'http://localhost:5000';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0A1A2F] text-white p-6 flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-[#00FFC2]/20 rounded-full animate-spin">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#00FFC2] rounded-full animate-spin-fast" style={{ animationDirection: 'reverse' }}></div>
      </div>
      <GiBaseballBat className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#00FFC2] animate-bounce" />
    </div>
    <div className="mt-8 text-xl font-bold text-[#00FFC2]">Loading Stats</div>
    <div className="mt-2 text-sm text-gray-400">Fetching latest baseball statistics...</div>
    <div className="mt-4 flex space-x-1">
      <div className="w-3 h-3 bg-[#00FFC2] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-3 h-3 bg-[#00FFC2] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 bg-[#00FFC2] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  </div>
);

const styles = `
@keyframes spin-fast {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-fast {
  animation: spin-fast 1s linear infinite;
}
`;

const StatLeaderCard = ({ category, players }: { category: string, players: PlayerStat[] }) => {
  // Helper function to format stat values
  const formatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toString();
    }
    return value;
  };

  // Helper function to calculate progress bar width
  const calculateWidth = (value: string | number, category: string): number => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (category.toLowerCase().includes('average') || category.toLowerCase().includes('era')) {
      return numValue * 100;
    }
    const maxValue = Math.max(...players.map(p => 
      typeof p.value === 'number' ? p.value : parseFloat(p.value || '0')
    ));
    return (numValue / maxValue) * 100;
  };

  // Helper function to get stat color based on value
  const getStatColor = (key: string, value: string | number): string => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    switch (key) {
      case 'AVG':
      case 'OBP':
        return numValue >= 0.300 ? 'text-green-400' : numValue >= 0.250 ? 'text-yellow-400' : 'text-red-400';
      case 'SLG':
        return numValue >= 0.500 ? 'text-green-400' : numValue >= 0.400 ? 'text-yellow-400' : 'text-red-400';
      case 'OPS':
        return numValue >= 0.800 ? 'text-green-400' : numValue >= 0.700 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all border border-gray-700">
    <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#00FFC2] mb-1">{category}</h3>
          <p className="text-xs text-gray-400">
            {category.toLowerCase().includes('average') ? 'Minimum 10 at-bats' : 'Season Leaders'}
          </p>
        </div>
      <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-gray-400">Top 3</span>
      </div>
    </div>
    <div className="space-y-6">
      {players.map((player, index) => (
        <div key={index} className={`relative ${
            index === 0 ? 'bg-gradient-to-r from-gray-700/30 to-gray-800/30' : ''
          } rounded-lg p-5 transition-all hover:bg-gray-700/40`}>
            {/* Rank Medal */}
            <div className={`absolute -left-3 -top-3 w-10 h-10 rounded-full flex items-center justify-center ${
              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20' :
              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
              'bg-gradient-to-br from-amber-700 to-amber-900'
          }`}>
            <span className="text-sm font-bold">{player.rank}</span>
          </div>
          
            <div className="flex items-center gap-5">
            {/* Player Image */}
              <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden shadow-lg">
              {player.player.image ? (
                <img 
                  src={player.player.image} 
                  alt={player.player.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-full h-full p-4 text-gray-500" />
              )}
            </div>
            
            {/* Player Info */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">{player.player.name}</h4>
          <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{player.player.team}</span>
                      {index === 0 && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                          League Leader
              </span>
            )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-[#00FFC2]">{formatValue(player.value)}</div>
                  </div>
                </div>
                
                {/* Additional Stats Grid */}
                  {player.additionalStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {Object.entries(player.additionalStats).map(([key, value]) => (
                      <div key={key} className="text-center p-1 bg-gray-800/50 rounded">
                        <div className="text-xs text-gray-400">{key}</div>
                        <div className={`text-sm font-bold ${getStatColor(key, value)}`}>
                          {formatValue(value)}
                    </div>
                </div>
                    ))}
              </div>
                )}
              
              {/* Stats Bar */}
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-[#00FFC2] to-[#00FFC2]/70 transition-all duration-500" 
                  style={{ 
                      width: `${calculateWidth(player.value, category)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
};

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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  const processStatsData = (rawData: any[]) => {
    try {
      console.log('Processing raw data:', rawData.slice(0, 5));
      
      // Group data by player and track their at-bats and hits
      const playerStats = rawData.reduce((acc: StatsAccumulator, stat) => {
        const playerName = stat.player_name;
        if (!playerName) return acc;

        if (!acc[playerName]) {
          acc[playerName] = {
            name: playerName,
            team: stat.home_team || stat.away_team,
            atBats: 0,
            hits: 0,
            homeRuns: 0,
            singles: 0,
            doubles: 0,
            triples: 0,
            plateAppearances: 0,
            strikeouts: 0,
            walks: 0,
            hitByPitch: 0,
            sacrifices: 0,
            totalBases: 0,
            rbi: 0,
            runs: 0,
            stolenBases: 0,
            caughtStealing: 0,
            groundOuts: 0,
            flyOuts: 0,
            hardHitBalls: 0, // Exit velocity >= 95 mph
            totalPitchesSeen: 0
          };
        }

        // Track plate appearances and outcomes
        const events = stat.events;
        if (events !== null && events !== undefined) {
          // Count plate appearances and pitches seen
          acc[playerName].plateAppearances++;
          acc[playerName].totalPitchesSeen++;

          // Track hard-hit balls
          if (stat.hit_speed >= 95) {
            acc[playerName].hardHitBalls++;
          }

          // Track all batting outcomes
          const event = String(events).toLowerCase();
          switch (event) {
            case 'single':
              acc[playerName].hits++;
              acc[playerName].singles++;
              acc[playerName].totalBases += 1;
              acc[playerName].atBats++;
              break;
            case 'double':
              acc[playerName].hits++;
              acc[playerName].doubles++;
              acc[playerName].totalBases += 2;
              acc[playerName].atBats++;
              break;
            case 'triple':
              acc[playerName].hits++;
              acc[playerName].triples++;
              acc[playerName].totalBases += 3;
              acc[playerName].atBats++;
              break;
            case 'home_run':
              acc[playerName].hits++;
              acc[playerName].homeRuns++;
              acc[playerName].totalBases += 4;
              acc[playerName].atBats++;
              break;
            case 'strikeout':
              acc[playerName].strikeouts++;
              acc[playerName].atBats++;
              break;
            case 'walk':
              acc[playerName].walks++;
              break;
            case 'hit_by_pitch':
              acc[playerName].hitByPitch++;
              break;
            case 'sac_fly':
            case 'sac_bunt':
              acc[playerName].sacrifices++;
              break;
            case 'field_out':
            case 'force_out':
            case 'grounded_into_double_play':
              acc[playerName].atBats++;
              if (event.includes('ground')) {
                acc[playerName].groundOuts++;
              } else {
                acc[playerName].flyOuts++;
              }
              break;
            case 'stolen_base':
              acc[playerName].stolenBases++;
              break;
            case 'caught_stealing':
              acc[playerName].caughtStealing++;
              break;
          }
        }

        return acc;
      }, {});

      // Calculate additional statistics
      Object.values(playerStats).forEach((stats) => {
        // Basic stats
        stats.avg = stats.atBats > 0 ? (stats.hits / stats.atBats).toFixed(3) : '.000';
        stats.obp = stats.plateAppearances > 0 
          ? ((stats.hits + stats.walks + stats.hitByPitch) / 
             (stats.atBats + stats.walks + stats.hitByPitch + stats.sacrifices)).toFixed(3)
          : '.000';
        stats.slg = stats.atBats > 0 
          ? (stats.totalBases / stats.atBats).toFixed(3)
          : '.000';
        stats.ops = (parseFloat(stats.obp || '0') + parseFloat(stats.slg || '0')).toFixed(3);

        // Advanced stats
        stats.iso = stats.atBats > 0 
          ? (stats.totalBases - stats.hits) / stats.atBats
          : 0;
        stats.babip = (stats.atBats - stats.strikeouts - stats.homeRuns + stats.sacrifices) > 0
          ? ((stats.hits - stats.homeRuns) / (stats.atBats - stats.strikeouts - stats.homeRuns + stats.sacrifices)).toFixed(3)
          : '.000';
        stats.bbRate = stats.plateAppearances > 0
          ? ((stats.walks / stats.plateAppearances) * 100).toFixed(1) + '%'
          : '0.0%';
        stats.kRate = stats.plateAppearances > 0
          ? ((stats.strikeouts / stats.plateAppearances) * 100).toFixed(1) + '%'
          : '0.0%';
        stats.gbFbRatio = stats.flyOuts > 0
          ? (stats.groundOuts / stats.flyOuts).toFixed(2)
          : '0.00';
        stats.hardHitRate = stats.atBats > 0
          ? ((stats.hardHitBalls / stats.atBats) * 100).toFixed(1) + '%'
          : '0.0%';
      });

      // Convert to arrays and calculate batting average
      const battingLeaders = Object.values(playerStats)
        .filter((stats: any) => stats.atBats >= 10)
        .map((stats: any) => ({
          rank: 0,
          player: {
            name: stats.name,
            team: stats.team,
            image: ""
          },
          value: stats.avg,
          additionalStats: {
            'OBP': stats.obp,
            'SLG': stats.slg,
            'OPS': stats.ops,
            'ISO': stats.iso.toFixed(3),
            'BABIP': stats.babip,
            'BB%': stats.bbRate,
            'K%': stats.kRate,
            'HH%': stats.hardHitRate
          }
        }))
        .filter((player: any) => parseFloat(player.value) > 0)
        .sort((a: any, b: any) => parseFloat(b.value) - parseFloat(a.value))
        .slice(0, 3)
        .map((stat: any, index: number) => ({ ...stat, rank: index + 1 }));

      const homeRunLeaders = Object.values(playerStats)
        .filter((stats: any) => stats.homeRuns > 0)
        .map((stats: any) => ({
          rank: 0,
          player: {
            name: stats.name,
            team: stats.team,
            image: ""
          },
          value: stats.homeRuns,
          additionalStats: {
            'AVG': stats.avg,
            'SLG': stats.slg,
            'ISO': stats.iso.toFixed(3),
            'HH%': stats.hardHitRate,
            'TB': stats.totalBases,
            'BB%': stats.bbRate
          }
        }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 3)
        .map((stat: any, index: number) => ({ ...stat, rank: index + 1 }));

      console.log('Final processed stats:', {
        battingLeaders,
        homeRunLeaders
      });

      if (battingLeaders.length === 0 && homeRunLeaders.length === 0) {
        throw new Error('No valid batting statistics found in the data');
      }

      return {
        battingLeaders,
        homeRunLeaders
      };
    } catch (error) {
      console.error('Error processing stats data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Check if we have cached data that's still fresh
        const now = Date.now();
        if (stats && (now - lastFetchTime) < CACHE_DURATION) {
          setLoading(false);
          return;
        }

        console.log('Fetching stats from API...');
        const response = await fetch(`${API_BASE_URL}/api/baseball-stats`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid data format received from API');
        }
        
        if (data.data.length === 0) {
          setStats(null);
          return;
        }

        // Process the data with a small delay to show loading animation
        setTimeout(async () => {
          try {
            const processedStats = processStatsData(data.data);
            if (!processedStats.battingLeaders.length && !processedStats.homeRunLeaders.length) {
              setStats(null);
              return;
            }
            
            setStats(processedStats);
            setLastFetchTime(now);
            setError(null);
          } catch (err) {
            console.error('Error processing stats:', err);
            setError('Error processing statistics data');
            setStats(null);
          } finally {
            setLoading(false);
          }
        }, 800); // Show loading animation for at least 800ms for better UX

      } catch (err: any) {
        console.error('Error details:', err);
        setError(err.message || 'Failed to load stats. Please try again later.');
        setStats(null);
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedCategory]); // Only refetch when category changes

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] text-white p-6 flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

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
              {loading ? (
                <div className="col-span-3 text-center py-8">Loading stats...</div>
              ) : error ? (
                <div className="col-span-3 text-center py-8 text-red-500">{error}</div>
              ) : stats ? (
                <>
                  <StatLeaderCard 
                    category="Batting Average Leaders" 
                    players={stats.battingLeaders} 
                  />
                  <StatLeaderCard 
                    category="Home Run Leaders" 
                    players={stats.homeRunLeaders} 
                  />
                </>
              ) : (
                // Fallback to mock data if no stats available
                selectedCategory === 'batting'
                ? BATTING_LEADERS.map((category, index) => (
                    <StatLeaderCard key={index} {...category} />
                  ))
                : PITCHING_LEADERS.map((category, index) => (
                    <StatLeaderCard key={index} {...category} />
                  ))
              )}
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