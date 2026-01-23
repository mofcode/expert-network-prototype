'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Transcript, transcriptStorage, initializeSampleData } from '@/lib/storage';
import TranscriptModal from '@/components/TranscriptModal';
import UserProfileModal from '@/components/UserProfileModal';

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

// Helper to create user profile from expert name and role
function getUserProfile(name: string, role: string) {
  // Default expertise by role type
  const expertiseMap: Record<string, string[]> = {
    'VP Marketing': ['Marketing Strategy', 'Brand Management', 'GTM Strategy', 'Content Marketing'],
    'CTO': ['Technology Strategy', 'System Architecture', 'Engineering Leadership', 'Cloud Infrastructure'],
    'VP Sales': ['Sales Strategy', 'Enterprise Sales', 'Revenue Operations', 'Team Leadership'],
    'CFO': ['Financial Planning', 'Corporate Finance', 'Strategic Planning', 'Risk Management'],
    'Product Manager': ['Product Strategy', 'Roadmap Planning', 'User Research', 'Data Analysis'],
    'Engineering Manager': ['Team Management', 'Technical Leadership', 'Agile Development', 'Hiring'],
  };

  // Get expertise based on role, or use generic expertise
  let expertise = expertiseMap[role] || ['Industry Expertise', 'Strategic Planning', 'Best Practices', 'Innovation'];

  return {
    name,
    role,
    company: 'Enterprise Tech Company',
    expertise,
    badge: 'Active Expert',
    avatarUrl: getAvatarUrl(name),
  };
}

export default function TranscriptLibrary() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [filteredTranscripts, setFilteredTranscripts] = useState<Transcript[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<ReturnType<typeof getUserProfile> | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeSampleData();
    const allTranscripts = transcriptStorage.getAll();
    setTranscripts(allTranscripts);
    setFilteredTranscripts(allTranscripts);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const results = transcriptStorage.search(searchQuery, {
      category: selectedCategory,
      role: selectedRole,
    });
    setFilteredTranscripts(results);
  }, [searchQuery, selectedCategory, selectedRole, mounted]);

  const categories = Array.from(new Set(transcripts.map(t => t.category)));
  const roles = Array.from(new Set(transcripts.map(t => t.expertRole)));

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple rounded-lg mx-auto animate-pulse"></div>
            <p className="mt-4 text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transcript Library
          </h1>
          <p className="text-sm text-gray-600">
            Search 21,456 expert transcripts from practitioners across industries
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Search */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Transcripts
                </label>
                <input
                  type="text"
                  placeholder="e.g., Salesforce migration, pricing strategy, data warehouse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input pr-10 appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expert Role
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="input pr-10 appearance-none"
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Clear Button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedRole('');
                  }}
                  className="btn-outline w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredTranscripts.length}</span> results
              {(searchQuery || selectedCategory || selectedRole) && (
                <span className="ml-2 text-gray-500">
                  (filtered from {transcripts.length} total)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Results Grid */}
        {filteredTranscripts.length === 0 ? (
          <div className="card text-center py-16">
            <div className="mb-4 flex justify-center">
              <span className="material-symbols-outlined text-6xl text-gray-400">search</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No transcripts found</h3>
            <p className="text-sm text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedRole('');
              }}
              className="btn-primary"
            >
              View All Transcripts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTranscripts.map((transcript) => (
              <div
                key={transcript.id}
                onClick={() => {
                  setSelectedTranscript(transcript);
                  setIsModalOpen(true);
                }}
                className="card cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-purple">
                    {transcript.category}
                  </span>
                  <span className="text-xs text-gray-500">{transcript.date}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-purple transition-colors">
                  {transcript.topic}
                </h3>

                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={getAvatarUrl(transcript.expertName)}
                    alt={transcript.expertName}
                    className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-purple transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUserProfile(getUserProfile(transcript.expertName, transcript.expertRole));
                      setIsProfileModalOpen(true);
                    }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{transcript.expertName}</div>
                    <div className="text-xs text-gray-600">{transcript.expertRole}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {transcript.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {transcript.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge-outline text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-base">thumb_up</span>
                      <span className="font-medium">{transcript.upvotes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-base">description</span>
                      <span className="font-medium">{transcript.citations}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>{transcript.duration}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transcript Modal */}
        <TranscriptModal
          transcript={selectedTranscript}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTranscript(null);
          }}
          getAvatarUrl={getAvatarUrl}
          onAvatarClick={(name, role) => {
            setSelectedUserProfile(getUserProfile(name, role));
            setIsProfileModalOpen(true);
          }}
        />

        {/* User Profile Modal */}
        <UserProfileModal
          profile={selectedUserProfile}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedUserProfile(null);
          }}
        />
      </main>
    </div>
  );
}
