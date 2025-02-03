import { GameEvent, PlayerMetric } from '../types/game';

const VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export interface VisionResponse {
  labelAnnotations: Array<{
    description: string;
    score: number;
  }>;
  objectAnnotations: Array<{
    name: string;
    score: number;
    boundingPoly: {
      normalizedVertices: Array<{
        x: number;
        y: number;
      }>;
    };
  }>;
}

export const analyzeFrame = async (imageData: string): Promise<VisionResponse> => {
  try {
    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch(`${VISION_API_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to analyze image');
    }

    const data = await response.json();
    const result = data.responses[0];

    return {
      labelAnnotations: result.labelAnnotations || [],
      objectAnnotations: result.localizedObjectAnnotations || [],
    };
  } catch (error) {
    console.error('Error analyzing frame:', error);
    throw error;
  }
};

export const extractGameEvents = (annotations: VisionResponse) => {
  const events = [];
  const labels = annotations.labelAnnotations || [];
  const objects = annotations.objectAnnotations || [];

  // Process labels for game events
  for (const label of labels) {
    if (label.score < 0.7) continue; // Only consider high confidence detections

    if (label.description.toLowerCase().includes('bat') || label.description.toLowerCase().includes('swing')) {
      events.push({
        type: 'hit',
        description: 'Batter at the plate',
        confidence: label.score,
        timestamp: new Date().toISOString(),
      });
    } else if (label.description.toLowerCase().includes('pitch') || label.description.toLowerCase().includes('throw')) {
      events.push({
        type: 'pitch',
        description: 'Pitcher throwing',
        confidence: label.score,
        timestamp: new Date().toISOString(),
      });
    } else if (label.description.toLowerCase().includes('run') || label.description.toLowerCase().includes('base')) {
      events.push({
        type: 'run',
        description: 'Runner on base',
        confidence: label.score,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return events;
};

export const extractPlayerMetrics = (annotations: VisionResponse) => {
  const metrics = [];
  const objects = annotations.objectAnnotations || [];

  for (const obj of objects) {
    if (obj.score < 0.7) continue; // Only consider high confidence detections

    if (obj.name.toLowerCase().includes('person')) {
      const position = determinePosition(obj.boundingPoly.normalizedVertices);
      metrics.push({
        name: `Player ${metrics.length + 1}`,
        position: position,
        stats: {
          confidence: obj.score,
        },
      });
    }
  }

  return metrics;
};

const determinePosition = (vertices: Array<{ x: number; y: number }>) => {
  // Calculate center point of bounding box
  const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
  const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;

  // Simple position determination based on location in frame
  if (centerY > 0.7) {
    return 'Batter';
  } else if (centerY < 0.3 && Math.abs(centerX - 0.5) < 0.2) {
    return 'Pitcher';
  } else if (centerX < 0.3) {
    return 'Left Field';
  } else if (centerX > 0.7) {
    return 'Right Field';
  } else {
    return 'Center Field';
  }
}; 