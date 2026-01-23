'use client';

import { useState, useRef } from 'react';
import { SynthesisResponse } from '@/lib/ai-service';
import { Transcript } from '@/lib/storage';
import { Point } from '@/lib/geometry-utils';
import CitationCard from './CitationCard';
import VisualExplorerModal from './VisualExplorerModal';
import { BookOpen, Compass, ChevronDown, ChevronRight } from 'lucide-react';

interface AIResponsePanelProps {
  synthesis: SynthesisResponse;
  matchedTranscripts: Transcript[];
  markerPosition: Point;
  onMarkerMove: (position: Point) => void;
  nearbyTranscripts: Transcript[];
}

export default function AIResponsePanel({
  synthesis,
  matchedTranscripts,
  markerPosition,
  onMarkerMove,
  nearbyTranscripts,
}: AIResponsePanelProps) {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const getPerspectiveLabel = (value: number, axis: 'technical' | 'strategic') => {
    if (axis === 'technical') {
      if (value < -0.3) return 'Technical';
      if (value > 0.3) return 'Business';
      return 'Balanced Tech/Business';
    } else {
      if (value < -0.3) return 'Tactical';
      if (value > 0.3) return 'Strategic';
      return 'Balanced Tactical/Strategic';
    }
  };

  return (
    <div className="space-y-6">
      {/* Perspective Badge with Explorer Button */}
      <div className="flex items-center gap-2 text-sm text-gray-600 relative">
        <Compass className="w-4 h-4" />
        <span>Perspective:</span>
        <button
          ref={buttonRef}
          onClick={() => setIsExplorerOpen(!isExplorerOpen)}
          className="underline underline-offset-2 transition-colors"
          style={{ color: '#0073f5' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#005bc2'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#0073f5'}
          aria-label="Open visual explorer"
        >
          {getPerspectiveLabel(synthesis.perspective.technical, 'technical')},{' '}
          {getPerspectiveLabel(synthesis.perspective.strategic, 'strategic')}
        </button>

        {/* Visual Explorer Popup */}
        <VisualExplorerModal
          isOpen={isExplorerOpen}
          onClose={() => setIsExplorerOpen(false)}
          transcripts={matchedTranscripts}
          markerPosition={markerPosition}
          onMarkerMove={onMarkerMove}
          nearbyTranscripts={nearbyTranscripts}
          anchorRef={buttonRef}
        />
      </div>

      {/* Answer */}
      <div className="prose prose-sm max-w-none">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#201f23' }} />
            <h3 className="text-lg font-semibold text-gray-900 m-0">Answer</h3>
          </div>
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
            {synthesis.answer}
          </div>
        </div>
      </div>

      {/* Citations - Collapsible */}
      {synthesis.citations.length > 0 && (
        <div>
          <button
            onClick={() => setIsSourcesOpen(!isSourcesOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-purple-600 transition-colors"
          >
            {isSourcesOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Sources ({synthesis.citations.length})
          </button>

          {isSourcesOpen && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {synthesis.citations.map((citation, idx) => (
                <CitationCard
                  key={`${citation.transcriptId}-${idx}`}
                  transcriptId={citation.transcriptId}
                  expertName={citation.expertName}
                  topic={citation.topic}
                  quote={citation.quote}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
