'use client';

import { useState, useRef } from 'react';
import { SynthesisResponse } from '@/lib/ai-service';
import { Transcript } from '@/lib/storage';
import { Point } from '@/lib/geometry-utils';
import CitationCard from './CitationCard';
import VisualExplorerModal from './VisualExplorerModal';
import { BookOpen, Compass, ChevronDown, ChevronRight } from 'lucide-react';

// Helper function to get real professional photos for experts
function getAvatarUrl(name: string): string {
  const expertPhotos: Record<string, string> = {
    'Sarah James': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    'Alex Rodriguez': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'Maria Santos': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'James Kim': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  };

  if (expertPhotos[name]) {
    return expertPhotos[name];
  }

  const fallbackPhotos = [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % fallbackPhotos.length;
  return fallbackPhotos[index];
}

interface AIResponsePanelProps {
  synthesis: SynthesisResponse;
  matchedTranscripts: Transcript[];
  markerPosition: Point;
  onMarkerMove: (position: Point) => void;
  nearbyTranscripts: Transcript[];
}

// Component to render answer with inline expert avatars
function AnswerWithAvatars({ text, citations }: { text: string; citations: SynthesisResponse['citations'] }) {
  // Parse the answer text to find quoted sections and insert avatars
  const parts: JSX.Element[] = [];
  let lastIndex = 0;

  // Find all quoted sections using regex
  const quoteRegex = /"([^"]+)"/g;
  let match;
  let keyIndex = 0;

  while ((match = quoteRegex.exec(text)) !== null) {
    const beforeQuote = text.substring(lastIndex, match.index);
    const quote = match[1];

    // Add text before quote
    if (beforeQuote) {
      parts.push(<span key={`text-${keyIndex}`}>{beforeQuote}</span>);
      keyIndex++;
    }

    // Find matching citation for this quote
    const citation = citations.find(c => c.quote.includes(quote) || quote.includes(c.quote.substring(0, 50)));

    // Add quote with avatar if citation found
    parts.push(
      <span key={`quote-${keyIndex}`} className="inline">
        "{quote}"
        {citation && (
          <img
            src={getAvatarUrl(citation.expertName)}
            alt={citation.expertName}
            title={citation.expertName}
            className="inline-block w-5 h-5 rounded-full object-cover ml-1 align-middle"
          />
        )}
      </span>
    );
    keyIndex++;

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last quote
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${keyIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return <>{parts}</>;
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
            <AnswerWithAvatars text={synthesis.answer} citations={synthesis.citations} />
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
