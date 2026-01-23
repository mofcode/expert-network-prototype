'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Transcript } from '@/lib/storage';
import { X } from 'lucide-react';

interface TranscriptModalProps {
  transcript: Transcript | null;
  isOpen: boolean;
  onClose: () => void;
  getAvatarUrl: (name: string) => string;
  onAvatarClick?: (name: string, role: string) => void;
}

export default function TranscriptModal({
  transcript,
  isOpen,
  onClose,
  getAvatarUrl,
  onAvatarClick,
}: TranscriptModalProps) {
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

  if (!isOpen || !transcript) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <span className="badge-purple">
              {transcript.category}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {transcript.topic}
          </h2>

          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
            <img
              src={getAvatarUrl(transcript.expertName)}
              alt={transcript.expertName}
              className="w-12 h-12 rounded-xl object-cover cursor-pointer hover:ring-2 hover:ring-purple transition-all"
              onClick={() => onAvatarClick && onAvatarClick(transcript.expertName, transcript.expertRole)}
            />
            <div>
              <div className="text-base font-bold text-gray-900">{transcript.expertName}</div>
              <div className="text-sm text-gray-600">{transcript.expertRole}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-600 mb-6">
            <span className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-base">calendar_today</span>
              <span>{transcript.date}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>{transcript.duration}</span>
            </span>
          </div>

          {/* Key Insights */}
          <div className="mb-6 p-4 bg-yellow/10 rounded-lg border border-yellow/30">
            <div className="section-label text-rorange mb-3">KEY INSIGHTS</div>
            <ul className="space-y-2">
              {transcript.keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-900">
                  <span className="text-rorange font-bold mr-2 flex-shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Pattern Recognition */}
          <div className="mb-6 p-4 bg-purple/5 rounded-lg border border-purple/20">
            <div className="section-label text-purple mb-2">AI ANALYSIS</div>
            <p className="text-sm text-gray-700">
              <span className="font-bold text-purple">{transcript.citations}</span> other experts have mentioned similar patterns in their conversations. This aligns with G2 category data showing increased focus on this topic.
            </p>
          </div>

          {/* Transcript Content */}
          <div className="mb-6">
            <div className="section-label mb-3">SUMMARY</div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {transcript.content}
            </div>
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-gray-200">
            <div className="section-label mb-3">TOPICS</div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                {transcript.tags.map((tag) => (
                  <span key={tag} className="badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/library/${transcript.id}`}
                className="btn-secondary flex items-center space-x-2 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-base">description</span>
                <span>View Full Transcript</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
