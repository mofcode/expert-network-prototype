// AI service for Claude API integration

import { Transcript } from './storage';
import { generateMockCoordinates, generateMockSynthesis } from './mock-ai-service';

// Toggle to use mock service (no API calls)
const USE_MOCK_SERVICE = true;

export interface TranscriptCoordinates {
  technical: number;    // -1 (Technical) to 1 (Business)
  strategic: number;    // -1 (Tactical) to 1 (Strategic)
}

export interface Citation {
  transcriptId: string;
  expertName: string;
  topic: string;
  quote: string;
}

export interface SynthesisResponse {
  answer: string;
  citations: Citation[];
  perspective: {
    technical: number;
    strategic: number;
  };
}

/**
 * Generate coordinates for a single transcript using API route or mock
 */
async function generateCoordinatesForTranscript(
  transcript: Transcript
): Promise<TranscriptCoordinates> {
  // Use mock service if enabled
  if (USE_MOCK_SERVICE) {
    return generateMockCoordinates(transcript);
  }

  try {
    const response = await fetch('/api/generate-coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: transcript.topic,
        category: transcript.category,
        expertRole: transcript.expertRole,
        content: transcript.content,
        keyInsights: transcript.keyInsights,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const coordinates = await response.json();
    return coordinates;
  } catch (error) {
    console.error('Error generating coordinates:', error);
    // Return default coordinates on error
    return { technical: 0, strategic: 0 };
  }
}

/**
 * Generate coordinates for all transcripts in batches
 */
export async function generateCoordinatesForTranscripts(
  transcripts: Transcript[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, TranscriptCoordinates>> {
  const coordinatesMap = new Map<string, TranscriptCoordinates>();

  // Process transcripts one by one to avoid rate limiting
  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i];

    // Skip if already has coordinates
    if (transcript.coordinates) {
      coordinatesMap.set(transcript.id, transcript.coordinates);
      if (onProgress) onProgress(i + 1, transcripts.length);
      continue;
    }

    try {
      const coordinates = await generateCoordinatesForTranscript(transcript);
      coordinatesMap.set(transcript.id, coordinates);

      if (onProgress) {
        onProgress(i + 1, transcripts.length);
      }

      // Add small delay to avoid rate limiting (shorter for mock)
      if (i < transcripts.length - 1) {
        const delay = USE_MOCK_SERVICE ? 50 : 250;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Failed to generate coordinates for transcript ${transcript.id}:`, error);
      // Set default coordinates on error
      coordinatesMap.set(transcript.id, { technical: 0, strategic: 0 });
      if (onProgress) onProgress(i + 1, transcripts.length);
    }
  }

  return coordinatesMap;
}

/**
 * Synthesize answer from nearby transcripts
 */
export async function synthesizeAnswer(
  query: string,
  transcripts: Transcript[],
  markerPosition: { x: number; y: number }
): Promise<SynthesisResponse> {
  // Use mock service if enabled
  if (USE_MOCK_SERVICE) {
    return generateMockSynthesis(query, transcripts, markerPosition);
  }

  try {
    const response = await fetch('/api/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        transcripts,
        markerPosition,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const synthesis = await response.json();
    return synthesis;
  } catch (error) {
    console.error('Error synthesizing answer:', error);
    throw error;
  }
}

/**
 * Check if API key is configured (always return true since we use API routes)
 */
export function isAPIKeyConfigured(): boolean {
  return true; // API routes handle key validation
}
