'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { userStorage, transcriptStorage } from '@/lib/storage';

interface UserProfile {
  name: string;
  role: string;
  company: string;
  expertise: string[];
  badge: string;
  avatarUrl: string;
}

interface UserProfileModalProps {
  profile?: UserProfile | null;
  expertId?: string;
  isOpen?: boolean;
  onClose: () => void;
  onBookCall?: (expertId: string) => void;
}

// Helper function to get avatar URL
function getAvatarUrl(name: string): string {
  const expertPhotos: Record<string, string> = {
    'Sarah James': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    'Alex Rodriguez': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'Maria Santos': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'James Kim': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  };
  return expertPhotos[name] || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face';
}

export default function UserProfileModal({
  profile: propProfile,
  expertId,
  isOpen = true,
  onClose,
  onBookCall,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(propProfile || null);
  const [currentUser, setCurrentUser] = useState(userStorage.getCurrent());

  useEffect(() => {
    // If expertId is provided, build profile from transcripts
    if (expertId && !propProfile) {
      const transcripts = transcriptStorage.getAll();
      const expertTranscripts = transcripts.filter(t => t.expertId === expertId);

      if (expertTranscripts.length > 0) {
        const firstTranscript = expertTranscripts[0];
        const expertise = new Set<string>();

        expertTranscripts.forEach(t => {
          if (t.category) expertise.add(t.category);
          t.tags.forEach(tag => expertise.add(tag));
        });

        setProfile({
          name: firstTranscript.expertName,
          role: firstTranscript.expertRole,
          company: 'Expert Network Member',
          expertise: Array.from(expertise).slice(0, 8),
          badge: 'Active Expert',
          avatarUrl: getAvatarUrl(firstTranscript.expertName),
        });
      }
    } else if (propProfile) {
      setProfile(propProfile);
    }
  }, [expertId, propProfile]);

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

  if (!isOpen || !profile) return null;

  const isSeeker = currentUser?.activeProfileType === 'seeker';

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
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Profile Content */}
          <div className="flex items-start space-x-4 mb-6">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h2>
              <p className="text-sm text-gray-600 mb-2">{profile.role}</p>
              <p className="text-sm text-gray-500">{profile.company}</p>
            </div>
            <span className="badge-primary">{profile.badge}</span>
          </div>

          {/* Expertise Areas */}
          <div className="mb-6">
            <div className="section-label mb-3">EXPERTISE AREAS</div>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((skill) => (
                <span key={skill} className="badge-outline">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSeeker && expertId && onBookCall && (
              <button
                onClick={() => {
                  onBookCall(expertId);
                  onClose();
                }}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span className="material-symbols-outlined text-base">phone</span>
                <span>Book a Call</span>
              </button>
            )}
            <button className="btn-secondary w-full flex items-center justify-center space-x-2">
              <span className="material-symbols-outlined text-base">add</span>
              <span>Follow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
