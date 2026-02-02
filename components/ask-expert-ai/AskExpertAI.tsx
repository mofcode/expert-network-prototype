'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { transcriptStorage, Transcript } from '@/lib/storage';
import { generateCoordinatesForTranscripts, synthesizeAnswer, isAPIKeyConfigured, SynthesisResponse } from '@/lib/ai-service';
import { findNearestTranscripts, Point } from '@/lib/geometry-utils';
import AISearchInput from './AISearchInput';
import AIResponsePanel from './AIResponsePanel';
import { Loader2, AlertCircle } from 'lucide-react';
import SparkleIcon from '../icons/SparkleIcon';

type Status = 'idle' | 'initializing' | 'searching' | 'synthesizing' | 'complete' | 'error';

interface AskExpertAIProps {
  initialQuery?: string;
}

// Calculate number of nearby transcripts based on position
// Creates varying expert density across the quadrant
function calculateNearbyCount(position: Point): number {
  // Base count varies by quadrant position
  // Strategic positions (y > 0) have more experts (15-23)
  // Tactical positions (y < 0) have fewer experts (8-15)
  // This creates natural variation in expert availability

  const strategicWeight = (position.y + 1) / 2; // 0 to 1
  const technicalWeight = Math.abs(position.x); // 0 to 1

  // Base range: 8 to 23 experts
  const minCount = 8;
  const maxCount = 23;
  const range = maxCount - minCount;

  // Strategic positions have more experts
  const strategicBonus = strategicWeight * 0.6;
  // Extreme technical or business positions have fewer experts
  const extremePositionPenalty = technicalWeight * 0.3;

  const normalizedCount = strategicBonus - extremePositionPenalty + 0.4;
  const count = Math.floor(minCount + (range * Math.max(0, Math.min(1, normalizedCount))));

  return count;
}

export default function AskExpertAI({ initialQuery = '' }: AskExpertAIProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [query, setQuery] = useState('');
  const [matchedTranscripts, setMatchedTranscripts] = useState<Transcript[]>([]);
  const [markerPosition, setMarkerPosition] = useState<Point>({ x: 0, y: 0 });
  const [nearbyTranscripts, setNearbyTranscripts] = useState<Transcript[]>([]);
  const [synthesis, setSynthesis] = useState<SynthesisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [initProgress, setInitProgress] = useState({ current: 0, total: 0 });
  const [coordinatesReady, setCoordinatesReady] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [synthesisStage, setSynthesisStage] = useState<string>('');
  const [hasInitialSynthesis, setHasInitialSynthesis] = useState(false);
  const lastSynthesisPositionRef = useRef<Point | null>(null);

  // Check and generate coordinates on mount
  useEffect(() => {
    const initializeCoordinates = async () => {
      const allTranscripts = transcriptStorage.getAll();
      console.log('[AskExpertAI] Found transcripts:', allTranscripts.length);

      if (allTranscripts.length === 0) {
        setError('No transcripts found. Please ensure sample data is initialized.');
        setStatus('error');
        return;
      }

      // Check if coordinates are already generated
      const hasCoordinates = allTranscripts.every(t => t.coordinates);
      console.log('[AskExpertAI] Has coordinates:', hasCoordinates);

      if (hasCoordinates) {
        setCoordinatesReady(true);
        console.log('[AskExpertAI] Coordinates ready, status idle');
        return;
      }

      // Check API key
      if (!isAPIKeyConfigured()) {
        setError('AI features require API key configuration. Please add NEXT_PUBLIC_ANTHROPIC_API_KEY to your .env.local file.');
        setStatus('error');
        return;
      }

      // Generate coordinates
      setStatus('initializing');
      setInitProgress({ current: 0, total: allTranscripts.length });

      try {
        const coordinatesMap = await generateCoordinatesForTranscripts(
          allTranscripts,
          (current, total) => {
            setInitProgress({ current, total });
          }
        );

        // Update transcripts with coordinates
        const updatedTranscripts = allTranscripts.map(t => ({
          ...t,
          coordinates: coordinatesMap.get(t.id),
          aiMetadata: {
            coordinatesGeneratedAt: new Date().toISOString(),
          },
        }));

        transcriptStorage.setAll(updatedTranscripts);
        setCoordinatesReady(true);
        setStatus('idle');
      } catch (err) {
        console.error('Failed to initialize coordinates:', err);
        setError('Failed to initialize AI features. Please check your API key and try again.');
        setStatus('error');
      }
    };

    initializeCoordinates();
  }, []);

  // Auto-search if initialQuery is provided
  useEffect(() => {
    if (coordinatesReady && initialQuery && !hasAutoSearched) {
      console.log('[AskExpertAI] Auto-searching with initial query:', initialQuery);
      handleSearch(initialQuery);
      setHasAutoSearched(true);
    }
  }, [coordinatesReady, initialQuery, hasAutoSearched]);

  // Handle search
  const handleSearch = useCallback((searchQuery: string) => {
    console.log('[AskExpertAI] handleSearch called with:', searchQuery);
    setQuery(searchQuery);
    setStatus('searching');
    setError('');
    setSynthesis(null);
    setHasInitialSynthesis(false);
    lastSynthesisPositionRef.current = null;

    // Debug: Check what transcripts we have
    const allTranscripts = transcriptStorage.getAll();
    console.log('[AskExpertAI] All transcripts count:', allTranscripts.length);
    if (allTranscripts.length > 0) {
      console.log('[AskExpertAI] First transcript:', JSON.stringify(allTranscripts[0], null, 2));
    }

    const results = transcriptStorage.search(searchQuery);
    console.log('[AskExpertAI] Search results:', results.length);
    console.log('[AskExpertAI] Search query:', searchQuery);

    // Always use all transcripts for finding nearby experts to ensure variety
    // This allows the quadrant exploration to show different expert counts
    const transcriptsToShow = allTranscripts;
    console.log('[AskExpertAI] Using all transcripts for quadrant:', transcriptsToShow.length);

    setMatchedTranscripts(transcriptsToShow);

    // Find initial nearby transcripts (variable count based on position)
    // Marker starts at (0, 0) which is the balanced/center position
    const nearbyCount = calculateNearbyCount(markerPosition);
    console.log('[AskExpertAI] Initial search - Marker position:', markerPosition, 'Nearby count:', nearbyCount);
    const nearby = findNearestTranscripts(transcriptsToShow, markerPosition, nearbyCount);
    console.log('[AskExpertAI] Found nearby transcripts:', nearby.length);
    setNearbyTranscripts(nearby);

    // Trigger synthesis immediately after search
    setStatus('idle');
    setTimeout(() => {
      if (nearby.length > 0) {
        triggerSynthesisFromSearch(searchQuery, nearby, markerPosition);
      }
    }, 100);
  }, [markerPosition]);

  const triggerSynthesisFromSearch = async (searchQuery: string, transcripts: Transcript[], position: Point) => {
    setStatus('synthesizing');
    setError('');

    // Cycle through synthesis stages
    const stages = [
      'Analyzing your input',
      'Searching through transcripts',
      'Extracting key insights',
      'Synthesizing findings',
      'Preparing your summary'
    ];

    try {
      // Show each stage with a delay
      for (let i = 0; i < stages.length; i++) {
        setSynthesisStage(stages[i]);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const result = await synthesizeAnswer(searchQuery, transcripts, position);
      setSynthesis(result);
      setSynthesisStage('');
      lastSynthesisPositionRef.current = position;
      setHasInitialSynthesis(true);
      setStatus('complete');
    } catch (err) {
      console.error('Synthesis error:', err);
      setError('Failed to generate insights. Please try again.');
      setSynthesisStage('');
      setStatus('error');
    }
  };

  // Handle marker movement with debounced synthesis
  const handleMarkerMove = useCallback((newPosition: Point) => {
    setMarkerPosition(newPosition);

    if (matchedTranscripts.length === 0) return;

    // Update nearby transcripts immediately (variable count based on position)
    const nearbyCount = calculateNearbyCount(newPosition);
    console.log('[handleMarkerMove] New position:', newPosition, 'Nearby count:', nearbyCount);
    const nearby = findNearestTranscripts(matchedTranscripts, newPosition, nearbyCount);
    console.log('[handleMarkerMove] Found nearby transcripts:', nearby.length);
    setNearbyTranscripts(nearby);
  }, [matchedTranscripts]);

  // Trigger synthesis when marker stops moving (only after initial synthesis is complete)
  useEffect(() => {
    if (nearbyTranscripts.length === 0 || !query || !hasInitialSynthesis) return;

    // Only trigger if marker position has actually changed
    if (lastSynthesisPositionRef.current &&
        lastSynthesisPositionRef.current.x === markerPosition.x &&
        lastSynthesisPositionRef.current.y === markerPosition.y) {
      return;
    }

    const synthesisTimer = setTimeout(() => {
      triggerSynthesis();
    }, 500);

    return () => clearTimeout(synthesisTimer);
  }, [nearbyTranscripts, query, hasInitialSynthesis, markerPosition]);

  const getPerspectiveLabel = (position: Point): string => {
    let label = '';

    // Strategic vs Tactical
    if (position.y < -0.3) label += 'Tactical';
    else if (position.y > 0.3) label += 'Strategic';
    else label += 'Balanced';

    label += ' / ';

    // Technical vs Business
    if (position.x < -0.3) label += 'Technical';
    else if (position.x > 0.3) label += 'Business';
    else label += 'Balanced';

    return label;
  };

  const triggerSynthesis = async () => {
    if (nearbyTranscripts.length === 0 || !query) return;

    setStatus('synthesizing');
    setError('');

    // Show perspective shift message for marker movement
    const perspective = getPerspectiveLabel(markerPosition);
    setSynthesisStage(`Shifting focus to ${perspective} perspective`);

    try {
      // Keep the message visible for 2.5 seconds
      await new Promise(resolve => setTimeout(resolve, 2500));

      const result = await synthesizeAnswer(query, nearbyTranscripts, markerPosition);
      setSynthesis(result);
      setSynthesisStage('');
      lastSynthesisPositionRef.current = markerPosition;
      setStatus('complete');
    } catch (err) {
      console.error('Synthesis error:', err);
      setError('Failed to generate insights. Please try again.');
      setSynthesisStage('');
      setStatus('error');
    }
  };

  // Render loading state
  if (status === 'initializing') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-1 mb-4">
          <SparkleIcon className="w-6 h-6" />
          <h3 className="text-lg font-semibold text-gray-900">Ask Expert AI</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <div className="text-center">
            <p className="text-gray-900 font-medium mb-1">
              Analyzing transcript library...
            </p>
            <p className="text-sm text-gray-600">
              Processing {initProgress.current} of {initProgress.total} transcripts
            </p>
            <div className="w-64 h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${(initProgress.current / initProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'error' && !coordinatesReady) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-1 mb-4">
          <SparkleIcon className="w-6 h-6" />
          <h3 className="text-lg font-semibold text-gray-900">Ask Expert AI</h3>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-medium text-red-900 mb-1">
              Setup Required
            </p>
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasResults = matchedTranscripts.length > 0 && synthesis && status === 'complete';
  const isLoading = status === 'searching' || status === 'synthesizing';

  return (
    <div className="space-y-6">
      {/* Show input at top only if no results yet */}
      {!hasResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-1 mb-6">
            <SparkleIcon className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-gray-900">Ask Expert AI</h3>
          </div>

          <AISearchInput
            onSearch={handleSearch}
            disabled={isLoading}
            initialValue={initialQuery}
          />

          {/* Status indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-purple-600 mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {status === 'searching' ? 'Searching transcripts...' : (synthesisStage || 'Generating insights...')}
              </span>
            </div>
          )}

          {/* Error message */}
          {error && status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Results Section with sticky input at bottom */}
      {hasResults && (
        <>
          {/* Scrollable content area with padding for sticky input */}
          <div className="pb-32">
            {/* Combined query and AI response container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Expert AI label at top */}
              <div className="flex items-center gap-2 mb-6">
                <SparkleIcon className="w-6 h-6" />
                <h3 className="text-lg font-semibold text-gray-900">Expert AI</h3>
              </div>

              {/* Show the original query */}
              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-lg text-gray-600">person</span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-900">{query}</p>
                </div>
              </div>

              {/* AI Response */}
              <AIResponsePanel
                synthesis={synthesis}
                matchedTranscripts={matchedTranscripts}
                markerPosition={markerPosition}
                onMarkerMove={handleMarkerMove}
                nearbyTranscripts={nearbyTranscripts}
              />
            </div>
          </div>

          {/* Sticky follow-up input at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <AISearchInput
                  onSearch={handleSearch}
                  disabled={isLoading}
                  placeholder="Ask a follow-up question..."
                  showExamples={false}
                />

                {/* Status indicator for follow-up */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-purple-600 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {status === 'searching' ? 'Searching transcripts...' : (synthesisStage || 'Generating insights...')}
                    </span>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
