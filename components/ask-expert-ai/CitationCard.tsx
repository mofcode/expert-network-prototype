'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Helper function to get real professional photos for experts
function getAvatarUrl(name: string): string {
  // Map expert names to professional photo URLs
  const expertPhotos: Record<string, string> = {
    'Sarah James': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    'Alex Rodriguez': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'Maria Santos': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'James Kim': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  };

  // Return mapped photo or fallback to a professional headshot
  if (expertPhotos[name]) {
    return expertPhotos[name];
  }

  // Array of diverse professional headshot photo IDs
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

  // Use a hash-based approach to consistently assign photos
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % fallbackPhotos.length;
  return fallbackPhotos[index];
}

interface CitationCardProps {
  transcriptId: string;
  expertName: string;
  topic: string;
  quote: string;
}

export default function CitationCard({
  transcriptId,
  expertName,
  topic,
  quote,
}: CitationCardProps) {
  // Fallback for missing expert names
  const displayName = expertName || 'Expert';

  return (
    <Link
      href={`/library/${transcriptId}`}
      className="block p-4 bg-white border border-gray-200 rounded-lg
               hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={getAvatarUrl(displayName)}
              alt={displayName}
              className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
            />
            <span className="font-medium text-gray-900 text-sm truncate">
              {displayName}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">{topic}</p>
          <p className="text-sm text-gray-700 italic line-clamp-3">
            "{quote}"
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-purple-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
