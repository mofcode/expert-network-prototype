'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Transcript } from '@/lib/storage';
import { Point } from '@/lib/geometry-utils';
import QuadrantCanvas from './QuadrantCanvas';

interface VisualExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcripts: Transcript[];
  markerPosition: Point;
  onMarkerMove: (position: Point) => void;
  nearbyTranscripts: Transcript[];
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function VisualExplorerModal({
  isOpen,
  onClose,
  transcripts,
  markerPosition,
  onMarkerMove,
  nearbyTranscripts,
  anchorRef,
}: VisualExplorerModalProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target as Node))
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[400px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Adjust perspective
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Helper text */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs text-gray-600">
          Drag the marker to adjust the insight perspective
        </p>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Quadrant Canvas */}
        <QuadrantCanvas
          transcripts={[]}
          markerPosition={markerPosition}
          onMarkerMove={onMarkerMove}
          nearbyTranscripts={[]}
          theme="light"
          simplified={true}
        />
      </div>
    </div>
  );
}
