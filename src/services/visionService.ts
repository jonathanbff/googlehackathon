const VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

interface VisionResponse {
  labelAnnotations: Array<{
    description: string;
    score: number;
    topicality: number;
  }>;
  objectAnnotations: Array<{
    name: string;
    score: number;
    boundingPoly: {
      normalizedVertices: Array<{ x: number; y: number }>;
    };
  }>;
}

export const analyzeFrame = async (imageUrl: string): Promise<VisionResponse> => {
  try {
    const response = await fetch(`${VISION_API_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              source: {
                imageUri: imageUrl,
              },
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10,
              },
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 10,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze image');
    }

    return {
      labelAnnotations: data.responses[0].labelAnnotations || [],
      objectAnnotations: data.responses[0].localizedObjectAnnotations || [],
    };
  } catch (error) {
    console.error('Error analyzing frame:', error);
    throw error;
  }
};

export const extractGameEvents = (annotations: VisionResponse): GameEvent[] => {
  const events: GameEvent[] = [];
  const currentTime = new Date().toLocaleTimeString();

  // Map vision labels to game events
  annotations.labelAnnotations.forEach(label => {
    if (label.score > 0.8) { // Only consider high-confidence detections
      switch (label.description.toLowerCase()) {
        case 'baseball bat':
        case 'batting':
        case 'swing':
          events.push({
            timestamp: currentTime,
            type: 'hit',
            description: 'Batter at the plate',
          });
          break;
        case 'pitching':
        case 'pitcher':
          events.push({
            timestamp: currentTime,
            type: 'pitch',
            description: 'Pitcher throwing',
          });
          break;
        case 'running':
        case 'base':
          events.push({
            timestamp: currentTime,
            type: 'run',
            description: 'Runner in motion',
          });
          break;
        case 'catch':
        case 'fielding':
          events.push({
            timestamp: currentTime,
            type: 'out',
            description: 'Fielding play',
          });
          break;
      }
    }
  });

  return events;
};

export const extractPlayerMetrics = (annotations: VisionResponse): Partial<PlayerMetric>[] => {
  const metrics: Partial<PlayerMetric>[] = [];

  // Detect players and their positions
  annotations.objectAnnotations
    .filter(obj => obj.name.toLowerCase().includes('person') && obj.score > 0.7)
    .forEach((person, index) => {
      // Determine player position based on location on field
      const position = determinePosition(person.boundingPoly.normalizedVertices);
      
      metrics.push({
        name: `Player ${index + 1}`,
        position,
        stats: {
          // Add dynamic stats based on player position and movement
        },
      });
    });

  return metrics;
};

const determinePosition = (vertices: Array<{ x: number; y: number }>): string => {
  // Calculate center point of bounding box
  const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
  const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;

  // Simple position determination based on location
  if (centerY > 0.7) {
    return 'OF'; // Outfield
  } else if (centerX < 0.4) {
    return '1B'; // First base
  } else if (centerX > 0.6) {
    return '3B'; // Third base
  } else {
    return 'P'; // Pitcher/Infield
  }
}; 