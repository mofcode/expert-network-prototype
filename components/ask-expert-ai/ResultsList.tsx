'use client';

import { Transcript } from '@/lib/storage';
import { ThumbsUp, Quote } from 'lucide-react';
import Link from 'next/link';

interface ResultsListProps {
  transcripts: Transcript[];
  query?: string;
}

export default function ResultsList({ transcripts, query }: ResultsListProps) {
  if (transcripts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No results found</h3>
        <p className="text-sm text-gray-600">
          Try different keywords or browse all transcripts in the Library
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {transcripts.length} {transcripts.length === 1 ? 'Result' : 'Results'}
          {query && <span className="text-gray-500 font-normal"> for "{query}"</span>}
        </h3>
      </div>

      <div className="grid gap-4">
        {transcripts.map((transcript) => (
          <Link
            key={transcript.id}
            href={`/library/${transcript.id}`}
            className="card hover:border-purple/50 transition-all hover:shadow-md accent-border-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-secondary text-xs">
                    {transcript.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {transcript.date}
                  </span>
                </div>

                {/* Topic */}
                <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-purple transition-colors">
                  {transcript.topic}
                </h3>

                {/* Expert info */}
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{transcript.expertName}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span>{transcript.expertRole}</span>
                </p>

                {/* Key insights preview */}
                {transcript.keyInsights && transcript.keyInsights.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Key Insights:</p>
                    <ul className="space-y-1">
                      {transcript.keyInsights.slice(0, 2).map((insight, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                          <span className="line-clamp-1">{insight}</span>
                        </li>
                      ))}
                      {transcript.keyInsights.length > 2 && (
                        <li className="text-xs text-gray-500 ml-3">
                          +{transcript.keyInsights.length - 2} more insights
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {transcript.tags && transcript.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {transcript.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="badge-outline text-xs">
                        {tag}
                      </span>
                    ))}
                    {transcript.tags.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{transcript.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stats sidebar */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-gray-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{transcript.upvotes}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Quote className="w-4 h-4" />
                  <span className="text-sm font-medium">{transcript.citations}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {transcript.duration}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
