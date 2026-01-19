'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Transcript, transcriptStorage, initializeSampleData } from '@/lib/storage';

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

  // Fallback: Use a hash-based approach with professional photos
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash) % 1000;
  // Use Unsplash's seed parameter for consistent professional photos
  return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face&seed=${seed}`;
}

export default function TranscriptLibrary() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [filteredTranscripts, setFilteredTranscripts] = useState<Transcript[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
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
            <div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transcript List */}
          <div className="space-y-4">
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
              filteredTranscripts.map((transcript) => (
                <div
                  key={transcript.id}
                  onClick={() => setSelectedTranscript(transcript)}
                  className={`card cursor-pointer transition-all ${
                    selectedTranscript?.id === transcript.id
                      ? 'active shadow-md'
                      : 'hover:shadow-md'
                  }`}
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
                      className="w-8 h-8 rounded-lg object-cover"
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
              ))
            )}
          </div>

          {/* Transcript Detail Panel */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-120px)] overflow-y-auto">
            {selectedTranscript ? (
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <span className="badge-purple">
                    {selectedTranscript.category}
                  </span>
                  <button
                    onClick={() => setSelectedTranscript(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedTranscript.topic}
                </h2>

                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
                  <img
                    src={getAvatarUrl(selectedTranscript.expertName)}
                    alt={selectedTranscript.expertName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-base font-bold text-gray-900">{selectedTranscript.expertName}</div>
                    <div className="text-sm text-gray-600">{selectedTranscript.expertRole}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-600 mb-6">
                  <span className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    <span>{selectedTranscript.date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>{selectedTranscript.duration}</span>
                  </span>
                </div>

                {/* Key Insights */}
                <div className="mb-6 p-4 bg-yellow/10 rounded-lg border border-yellow/30">
                  <div className="section-label text-rorange mb-3">KEY INSIGHTS</div>
                  <ul className="space-y-2">
                    {selectedTranscript.keyInsights.map((insight, idx) => (
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
                    <span className="font-bold text-purple">{selectedTranscript.citations}</span> other experts have mentioned similar patterns in their conversations. This aligns with G2 category data showing increased focus on this topic.
                  </p>
                </div>

                {/* Transcript Content */}
                <div className="mb-6">
                  <div className="section-label mb-3">FULL TRANSCRIPT</div>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedTranscript.content}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <div className="section-label mb-3">TOPICS</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTranscript.tags.map((tag) => (
                      <span key={tag} className="badge-outline">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-200 space-y-3">
                  <button className="btn-primary w-full flex items-center justify-center space-x-2">
                    <span className="material-symbols-outlined text-base">chat</span>
                    <span>Book Call with Expert - $400</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn-secondary flex items-center justify-center space-x-2">
                      <span className="material-symbols-outlined text-base">download</span>
                      <span>Export</span>
                    </button>
                    <button className="btn-outline flex items-center justify-center space-x-2">
                      <span className="material-symbols-outlined text-base">thumb_up</span>
                      <span>Upvote ({selectedTranscript.upvotes})</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card card-no-hover text-center py-16 border-dashed border-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Select a Transcript
                </h3>
                <p className="text-sm text-gray-600">
                  Click any transcript to view full details
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
