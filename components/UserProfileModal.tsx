'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface UserProfile {
  name: string;
  role: string;
  company: string;
  expertise: string[];
  badge: string;
  avatarUrl: string;
}

interface UserProfileModalProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  profile,
  isOpen,
  onClose,
}: UserProfileModalProps) {
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

          {/* Follow Button */}
          <button className="btn-primary w-full flex items-center justify-center space-x-2">
            <span className="material-symbols-outlined text-base">add</span>
            <span>Follow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
