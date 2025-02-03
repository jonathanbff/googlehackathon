import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "hero": {
        "title": "Your Personal Baseball Story",
        "subtitle": "Experience baseball in your language, your way. Get personalized highlights, commentary, and insights tailored to your favorite teams and players.",
        "startWatching": "Start Watching",
        "liveAnalysis": "Live Analysis"
      },
      "tech": {
        "aiAnalysis": {
          "title": "AI Analysis",
          "description": "Advanced machine learning for real-time game analysis and insights"
        },
        "neuralTranslation": {
          "title": "Neural Translation",
          "description": "State-of-the-art language models for natural translations"
        },
        "realtime": {
          "title": "Real-time Processing",
          "description": "High-performance video analysis and instant highlights generation"
        },
        "personalization": {
          "title": "Smart Personalization",
          "description": "ML-powered content curation based on user preferences"
        }
      },
      "featured": {
        "title": "Featured Game",
        "watchAnalysis": "Watch Analysis",
        "watchYoutube": "Watch on YouTube"
      },
      "search": {
        "placeholder": "Search for teams, players, or games...",
        "trending": "Trending"
      },
      "categories": {
        "featured": "Featured",
        "perfectGames": "Perfect Games",
        "worldSeries": "World Series",
        "historicGames": "Historic Games",
        "records": "Records",
        "iconicMoments": "Iconic Moments",
        "highlights": "Highlights",
        "liveGames": "Live Games"
      },
      "mlb": {
        "title": "Want More Baseball?",
        "description": "Visit MLB's Official YouTube Channel for more highlights, classic games, and exclusive content",
        "button": "Visit MLB Channel"
      },
      "navigation": {
        "home": "Home",
        "liveAnalysis": "Live Analysis",
        "stats": "Stats",
        "players": "Players",
        "settings": "Settings"
      },
      "auth": {
        "signIn": "Sign In"
      }
    }
  },
  es: {
    translation: {
      "hero": {
        "title": "Tu Historia Personal del Béisbol",
        "subtitle": "Vive el béisbol en tu idioma, a tu manera. Obtén momentos destacados personalizados, comentarios y análisis adaptados a tus equipos y jugadores favoritos.",
        "startWatching": "Comenzar a Ver",
        "liveAnalysis": "Análisis en Vivo"
      },
      "tech": {
        "aiAnalysis": {
          "title": "Análisis con IA",
          "description": "Aprendizaje automático avanzado para análisis de juegos en tiempo real"
        },
        "neuralTranslation": {
          "title": "Traducción Neural",
          "description": "Modelos de lenguaje de última generación para traducciones naturales"
        },
        "realtime": {
          "title": "Procesamiento en Tiempo Real",
          "description": "Análisis de video de alto rendimiento y generación instantánea de momentos destacados"
        },
        "personalization": {
          "title": "Personalización Inteligente",
          "description": "Curación de contenido impulsada por IA basada en preferencias del usuario"
        }
      },
      "featured": {
        "title": "Juego Destacado",
        "watchAnalysis": "Ver Análisis",
        "watchYoutube": "Ver en YouTube"
      },
      "search": {
        "placeholder": "Buscar equipos, jugadores o juegos...",
        "trending": "Tendencias"
      },
      "categories": {
        "featured": "Destacados",
        "perfectGames": "Juegos Perfectos",
        "worldSeries": "Serie Mundial",
        "historicGames": "Juegos Históricos",
        "records": "Récords",
        "iconicMoments": "Momentos Icónicos",
        "highlights": "Destacados",
        "liveGames": "Juegos en Vivo"
      },
      "mlb": {
        "title": "¿Quieres Más Béisbol?",
        "description": "Visita el canal oficial de MLB en YouTube para más momentos destacados, juegos clásicos y contenido exclusivo",
        "button": "Visitar Canal MLB"
      },
      "navigation": {
        "home": "Home",
        "liveAnalysis": "Análisis en Vivo",
        "stats": "Estadísticas",
        "players": "Jugadores",
        "settings": "Configuraciones"
      },
      "auth": {
        "signIn": "Iniciar Sesión"
      }
    }
  },
  ja: {
    translation: {
      "hero": {
        "title": "あなたの野球ストーリー",
        "subtitle": "あなたの言語で、あなたの方法で野球を体験。お気に入りのチームと選手に合わせたパーソナライズされたハイライト、解説、インサイトを取得。",
        "startWatching": "視聴を開始",
        "liveAnalysis": "ライブ分析"
      },
      "tech": {
        "aiAnalysis": {
          "title": "AI分析",
          "description": "リアルタイムの試合分析とインサイトのための高度な機械学習"
        },
        "neuralTranslation": {
          "title": "ニューラル翻訳",
          "description": "自然な翻訳のための最先端の言語モデル"
        },
        "realtime": {
          "title": "リアルタイム処理",
          "description": "高性能な動画分析とインスタントハイライト生成"
        },
        "personalization": {
          "title": "スマートパーソナライゼーション",
          "description": "ユーザー設定に基づくAI駆動のコンテンツキュレーション"
        }
      },
      "featured": {
        "title": "注目の試合",
        "watchAnalysis": "分析を見る",
        "watchYoutube": "YouTubeで見る"
      },
      "search": {
        "placeholder": "チーム、選手、試合を検索...",
        "trending": "トレンド"
      },
      "categories": {
        "featured": "注目",
        "perfectGames": "完全試合",
        "worldSeries": "ワールドシリーズ",
        "historicGames": "歴史的な試合",
        "records": "記録",
        "iconicMoments": "象徴的な瞬間",
        "highlights": "ハイライト",
        "liveGames": "ライブ試合"
      },
      "mlb": {
        "title": "もっと野球を見たい？",
        "description": "MLBの公式YouTubeチャンネルで、さらなるハイライト、クラシックゲーム、独占コンテンツをチェック",
        "button": "MLBチャンネルを見る"
      },
      "navigation": {
        "home": "Home",
        "liveAnalysis": "ライブ分析",
        "stats": "統計",
        "players": "選手",
        "settings": "設定"
      },
      "auth": {
        "signIn": "ログイン"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;