'use client';

import { useState, useEffect } from 'react';
import { transcriptStorage, userStorage } from '@/lib/storage';
import ExpertCard from './ExpertCard';

interface FeaturedExpertsProps {
  onBookCall: (expertId: string) => void;
  onViewProfile: (expertId: string) => void;
}

// Helper function to get avatar URL
function getAvatarUrl(name: string): string {
  const expertPhotos: Record<string, string> = {
    'Sarah James': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    'Alex Rodriguez': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'Maria Santos': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'James Kim': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    'Zoe Phillips': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    'Stella Ward': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  };

  if (expertPhotos[name]) {
    return expertPhotos[name];
  }

  // Array of diverse professional headshot photos
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

  // Use hash to consistently select from photo array
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % fallbackPhotos.length;
  return fallbackPhotos[index];
}

export default function FeaturedExperts({ onBookCall, onViewProfile }: FeaturedExpertsProps) {
  const [experts, setExperts] = useState<any[]>([]);

  useEffect(() => {
    // Get current user's interests
    const currentUser = userStorage.getCurrent();
    const userInterests = currentUser?.profiles.seeker?.interests || [];

    // Aggregate transcript data to find relevant experts
    const transcripts = transcriptStorage.getAll();
    const expertMap = new Map<string, any>();

    transcripts.forEach(t => {
      const key = `${t.expertName}-${t.expertRole}`;
      if (!expertMap.has(key)) {
        expertMap.set(key, {
          id: t.expertId,
          name: t.expertName,
          role: t.expertRole,
          company: 'Expert Network Member',
          expertise: new Set<string>(),
          stats: {
            transcripts: 0,
            citations: 0,
            upvotes: 0,
          },
          relevanceScore: 0,
        });
      }

      const expert = expertMap.get(key);
      expert.stats.transcripts++;
      expert.stats.citations += t.citations;
      expert.stats.upvotes += t.upvotes;

      // Add category and tags as expertise
      if (t.category) expert.expertise.add(t.category);
      t.tags.forEach(tag => expert.expertise.add(tag));

      // Calculate relevance based on user interests
      if (userInterests.length > 0) {
        const transcriptContent = `${t.category} ${t.tags.join(' ')} ${t.topic}`.toLowerCase();
        userInterests.forEach(interest => {
          if (transcriptContent.includes(interest.toLowerCase())) {
            expert.relevanceScore += 1;
          }
        });
      }
    });

    // Convert to array and sort by relevance score, then citations
    const topExperts = Array.from(expertMap.values())
      .map(e => ({
        ...e,
        expertise: Array.from(e.expertise),
      }))
      .sort((a, b) => {
        // If user has interests, prioritize relevance
        if (userInterests.length > 0) {
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
        }
        // Then sort by citations
        return b.stats.citations - a.stats.citations;
      })
      .slice(0, 3);

    setExperts(topExperts);
  }, []);

  if (experts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommended Experts</h2>
        <p className="text-sm text-gray-600">
          Top experts matched to your interests in CRM, product strategy, and pricing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experts.map((expert) => (
          <ExpertCard
            key={expert.id}
            {...expert}
            avatarUrl={getAvatarUrl(expert.name)}
            onBookCall={onBookCall}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    </div>
  );
}
