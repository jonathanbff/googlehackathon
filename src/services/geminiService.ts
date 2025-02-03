import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameStats, GameEvent, PlayerStats } from '../types/game';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface ChapterSummary {
  timecode: string;
  chapterSummary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Development mock data
const MOCK_NARRATION = `
[Game Summary]
In this intense matchup, we're witnessing a classic pitcher's duel with moments of offensive brilliance. The game showcases exceptional pitching mechanics, strategic at-bats, and stellar defensive plays.

[Key Players]
PITCHING:
- John Smith (Starting Pitcher)
  • Dominant fastball command (95-97 mph range)
  • 42 pitches, 78% strike rate
  • Effective mix of 4-seam fastball and slider
  • Notable strikeout sequence in the 3rd inning

BATTING:
- Mike Johnson (Left Fielder)
  • Impressive .325 batting average
  • 87 hits this season
  • 12 home runs
  • Excellent plate discipline
  • Key line drive to center field

[Game Flow Analysis]
1st-3rd Inning:
- Pitcher establishes dominance with fastball command
- Strategic defensive shifts limiting offensive opportunities
- Notable defensive plays in shallow outfield

4th-6th Inning:
- Batters adjusting to pitch sequencing
- Increased pressure on base paths
- Key moments of situational hitting

[Strategic Insights]
- Defensive positioning effectively neutralizing pull hitters
- Pitch sequencing showing clear game plan against power hitters
- Base running aggression forcing defensive pressure

[Statistical Highlights]
Pitching:
- Strike Rate: 78%
- First Pitch Strikes: 65%
- Ground Ball Rate: 55%
- Swing & Miss Rate: 32%

Batting:
- Team BABIP: .295
- Hard Hit Rate: 42%
- Exit Velocity Avg: 92.3 mph
- Contact Rate: 82%

[Game-Changing Moments]
1. 3rd Inning: Perfect pitch sequence leading to key strikeout
2. 4th Inning: Strategic base running creating scoring opportunity
3. 5th Inning: Defensive shift preventing extra-base hit
`;

const MOCK_GAME_STATS: GameStats = {
  players: [
    {
      name: "John Smith",
      position: "Pitcher",
      stats: {
        pitchSpeed: "95-97 mph",
        pitchCount: 42,
        strikeRate: "78%",
        firstPitchStrikes: "65%",
        groundBallRate: "55%",
        swingMissRate: "32%",
      },
      highlights: [
        "Dominant fastball command in 95-97 mph range",
        "Effective mix of 4-seam fastball and slider",
        "Notable strikeout sequence in 3rd inning"
      ]
    },
    {
      name: "Mike Johnson",
      position: "Left Fielder",
      stats: {
        battingAvg: ".325",
        hits: 87,
        homeRuns: 12,
        hardHitRate: "42%",
        exitVelocity: "92.3 mph",
        contactRate: "82%",
      },
      highlights: [
        "Excellent plate discipline",
        "Key line drive to center field",
        "Consistent hard contact"
      ]
    }
  ],
  events: [
    {
      type: "pitch",
      timestamp: new Date().toISOString(),
      description: "Fastball, high and outside",
      inning: 1,
      half: "top",
      details: {
        pitchSpeed: 96,
        pitchType: "4-seam fastball",
        location: "high outside"
      }
    },
    {
      type: "hit",
      timestamp: new Date().toISOString(),
      description: "Line drive to center field",
      inning: 1,
      half: "top",
      details: {
        exitVelocity: 98.5,
        hitType: "line drive",
        location: "center field",
        result: "single"
      }
    },
    {
      type: "run",
      timestamp: new Date().toISOString(),
      description: "Runner advancing to second base",
      inning: 1,
      half: "top"
    }
  ],
  summary: {
    pitching: {
      strikeRate: "78%",
      firstPitchStrikes: "65%",
      groundBallRate: "55%",
      swingMissRate: "32%"
    },
    batting: {
      teamBabip: ".295",
      hardHitRate: "42%",
      exitVelocity: "92.3 mph",
      contactRate: "82%"
    }
  }
};

const extractVideoFrames = async (videoUrl: string, numFrames = 5): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];

    video.crossOrigin = 'anonymous';
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const interval = video.duration / (numFrames + 1);
      let currentFrame = 1;

      const captureFrame = () => {
        if (currentFrame <= numFrames) {
          video.currentTime = interval * currentFrame;
          currentFrame++;
        } else {
          video.removeEventListener('seeked', handleSeeked);
          resolve(frames);
        }
      };

      const handleSeeked = () => {
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.8));
          captureFrame();
        }
      };

      video.addEventListener('seeked', handleSeeked);
      captureFrame();
    };

    video.onerror = reject;
  });
};

export const generateVideoNarration = async (videoUrl: string): Promise<ChapterSummary[]> => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return [{
        timecode: "0:00",
        chapterSummary: MOCK_NARRATION
      }];
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });
    const frames = await extractVideoFrames(videoUrl);
    
    const response = await model.generateContent([
      ...frames.map(frame => ({
        inlineData: {
          data: frame.split(',')[1],
          mimeType: 'image/jpeg',
        },
      })),
      {
        text: `Analyze these frames from a baseball game video and provide a play-by-play narration. 
        Focus on key events, player actions, and game-changing moments. 
        Return the result in JSON format with timecode and chapterSummary for each event.
        Example format:
        [
          {
            "timecode": "0:00",
            "chapterSummary": "Pitcher winds up for the first pitch..."
          }
        ]`,
      },
    ]);

    const result = await response.response.text();
    try {
      return JSON.parse(result);
    } catch {
      return [{
        timecode: "0:00",
        chapterSummary: result
      }];
    }
  } catch (error) {
    console.error('Error generating video narration:', error);
    return [{
      timecode: "0:00",
      chapterSummary: MOCK_NARRATION
    }];
  }
};

export const chatWithGemini = async (messages: ChatMessage[]): Promise<string> => {
  try {
    // For development, return mock responses
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return "I can help analyze that play! The pitcher showed excellent command of their fastball, and the batter demonstrated good plate discipline. What specific aspect would you like to discuss?";
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    return result.response.text();
  } catch (error) {
    console.error('Error chatting with Gemini:', error);
    return "I apologize, but I'm having trouble analyzing that right now. Could you try rephrasing your question?";
  }
};

export const analyzeGameHighlights = async (videoUrl: string): Promise<{ narration: string; stats: GameStats }> => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      return {
        narration: MOCK_NARRATION,
        stats: MOCK_GAME_STATS
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });
    const frames = await extractVideoFrames(videoUrl, 10);
    
    const response = await model.generateContent([
      ...frames.map(frame => ({
        inlineData: {
          data: frame.split(',')[1],
          mimeType: 'image/jpeg',
        },
      })),
      {
        text: `Analyze these frames from a baseball game and provide two outputs:

1. A narrative analysis in this format:
[Game Summary]
Brief overview of the game situation and general flow.
... (rest of the narrative format)

2. A structured JSON output for stats and events in this format:
{
  "players": [
    {
      "name": "Player Name",
      "position": "Position",
      "stats": {
        "key": "value",
        // Include all relevant stats
      },
      "highlights": [
        "Notable achievement 1",
        "Notable achievement 2"
      ]
    }
  ],
  "events": [
    {
      "type": "pitch|hit|run|out",
      "timestamp": "ISO timestamp",
      "description": "Event description",
      "inning": number,
      "half": "top|bottom",
      "details": {
        // Optional details specific to event type
        "pitchSpeed": number,
        "pitchType": "string",
        "exitVelocity": number,
        "hitType": "string",
        "location": "string",
        "result": "string"
      }
    }
  ],
  "summary": {
    "pitching": {
      "strikeRate": "string",
      "firstPitchStrikes": "string",
      "groundBallRate": "string",
      "swingMissRate": "string"
    },
    "batting": {
      "teamBabip": "string",
      "hardHitRate": "string",
      "exitVelocity": "string",
      "contactRate": "string"
    }
  }
}

Provide detailed, professional-level baseball analysis with specific metrics, observations, and strategic insights. Include all relevant statistics and events observed in the frames.`,
      },
    ]);

    const result = await response.response.text();
    
    // Try to extract JSON stats from the response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    let stats = MOCK_GAME_STATS;
    
    if (jsonMatch) {
      try {
        stats = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Error parsing stats JSON:', error);
      }
    }

    // Remove the JSON part from the narration
    const narration = result.replace(/\{[\s\S]*\}/, '').trim();

    return {
      narration,
      stats
    };
  } catch (error) {
    console.error('Error analyzing game highlights:', error);
    return {
      narration: MOCK_NARRATION,
      stats: MOCK_GAME_STATS
    };
  }
}; 