'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { User, userStorage, transcriptStorage, opportunityStorage, bookingStorage, initializeSampleData, Transcript } from '@/lib/storage';
import Link from 'next/link';
import AskExpertAIWidget from '@/components/AskExpertAIWidget';
import FeaturedExperts from '@/components/seeker/FeaturedExperts';
import PostOpportunityModal from '@/components/seeker/PostOpportunityModal';
import BookExpertModal from '@/components/seeker/BookExpertModal';
import TranscriptModal from '@/components/TranscriptModal';
import UserProfileModal from '@/components/UserProfileModal';

// Helper function to get avatar URL
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

export default function SeekerHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTranscripts, setTrendingTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPostOpportunityModal, setShowPostOpportunityModal] = useState(false);

  useEffect(() => {
    initializeSampleData();

    // Check user profile
    const currentUser = userStorage.getCurrent();
    setUser(currentUser);

    if (currentUser?.activeProfileType === 'expert') {
      // Redirect to expert home
      router.replace('/');
      return;
    }

    // Load relevant transcripts based on user interests
    const allTranscripts = transcriptStorage.getAll();
    const userInterests = currentUser?.profiles.seeker?.interests || [];

    // Score transcripts by relevance to user interests
    const scoredTranscripts = allTranscripts.map(t => {
      let relevanceScore = 0;
      const content = `${t.category} ${t.tags.join(' ')} ${t.topic}`.toLowerCase();

      userInterests.forEach(interest => {
        if (content.includes(interest.toLowerCase())) {
          relevanceScore += 2; // Higher weight for interest match
        }
      });

      // Add engagement score (normalized)
      const engagementScore = (t.upvotes + t.citations) / 10;

      return {
        ...t,
        totalScore: relevanceScore + engagementScore,
      };
    });

    // Sort by total score and take top 6
    const recommended = scoredTranscripts
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 6);

    setTrendingTranscripts(recommended);

    setMounted(true);
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/library?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/library?category=${encodeURIComponent(category)}`);
  };

  const handleBookCall = (expertId: string) => {
    setSelectedExpertId(expertId);
    setShowBookingModal(true);
  };

  const handleViewProfile = (expertId: string) => {
    setSelectedExpertId(expertId);
  };

  const quickCategories = [
    'CRM',
    'Marketing',
    'Product',
    'Engineering',
    'Pricing',
    'Data Analytics',
  ];

  const activeRequests = user?.profiles.seeker
    ? [
        ...user.profiles.seeker.postedOpportunities,
        ...user.profiles.seeker.bookings.filter(id => {
          const booking = bookingStorage.getById(id);
          return booking?.status === 'requested' || booking?.status === 'confirmed';
        }),
      ]
    : [];

  if (!mounted || !user) {
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm">
        {/* Search Hero */}
        <div className="card bg-gradient-to-br from-purple/5 to-purple/10 border-purple/20 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              What are you looking to learn about?
            </h1>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 5,000+ expert transcripts..."
                  className="w-full px-6 py-4 pr-12 rounded-xl border border-gray-300 focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none text-base"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-purple hover:bg-purple/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">search</span>
                </button>
              </div>
            </form>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-purple hover:text-purple transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Experts */}
        <FeaturedExperts
          onBookCall={handleBookCall}
          onViewProfile={handleViewProfile}
        />

        {/* Active Requests Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Active Requests</h2>
            <p className="text-sm text-gray-600">
              Track your ongoing opportunities and bookings
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Post an Opportunity Card */}
            <button
              onClick={() => setShowPostOpportunityModal(true)}
              className="card bg-gradient-to-br from-green/5 to-green/10 border-green/20 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl text-green">add_circle</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Post an Opportunity</h3>
                  <p className="text-sm text-gray-600">
                    Share a paid request with the expert network
                  </p>
                </div>
              </div>
            </button>

            {activeRequests.length > 0 && activeRequests.map((id) => {
                const opportunity = opportunityStorage.getAll().find(o => o.id === id);
                const booking = bookingStorage.getById(id);
                const item = opportunity || booking;

                if (!item) return null;

                return (
                  <div key={id} className="card border-l-4 border-l-orange flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="badge-secondary text-xs">
                          {booking ? 'Expert Call' : 'Opportunity'}
                        </span>
                        {booking && (
                          <span className={`badge-${booking.status === 'confirmed' ? 'success' : 'warning'} text-xs`}>
                            {booking.status}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ${item.payment}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      {'topic' in item ? item.topic : item.title}
                    </h3>
                    {booking && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">with {booking.expertName}</p>
                        <p className="text-xs text-gray-500 mt-1">{booking.duration} minutes</p>
                      </div>
                    )}
                    {opportunity && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {opportunity.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {booking && booking.status === 'requested' && 'Waiting for confirmation'}
                        {booking && booking.status === 'confirmed' && 'Confirmed'}
                        {opportunity && 'Posted to network'}
                      </span>
                      <button className="text-xs font-medium text-purple hover:text-purple-dark">
                        View Details →
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Don't Miss These - Full Width */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Don't Miss These</h2>
            <p className="text-sm text-gray-600">
              Top insights matched to your interests in CRM, product strategy, and pricing
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTranscripts.map((transcript) => (
              <button
                key={transcript.id}
                onClick={() => setSelectedTranscript(transcript)}
                className="card hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <span className="badge-secondary text-xs">{transcript.category}</span>
                  <span className="text-xs text-gray-500">{transcript.duration}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                  {transcript.topic}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {transcript.expertName} • {transcript.expertRole}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-base">thumb_up</span>
                    <span>{transcript.upvotes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-base">format_quote</span>
                    <span>{transcript.citations}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Transcript Modal */}
      <TranscriptModal
        transcript={selectedTranscript}
        isOpen={!!selectedTranscript}
        onClose={() => setSelectedTranscript(null)}
        getAvatarUrl={getAvatarUrl}
      />

      {/* User Profile Modal */}
      {selectedExpertId && !showBookingModal && (
        <UserProfileModal
          expertId={selectedExpertId}
          onClose={() => setSelectedExpertId(null)}
          onBookCall={handleBookCall}
        />
      )}

      {/* Book Expert Modal */}
      <BookExpertModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedExpertId(null);
        }}
        expertId={selectedExpertId || undefined}
        onSuccess={() => {
          // Reload user data
          const updatedUser = userStorage.getCurrent();
          setUser(updatedUser);
        }}
      />

      {/* Post Opportunity Modal */}
      <PostOpportunityModal
        isOpen={showPostOpportunityModal}
        onClose={() => setShowPostOpportunityModal(false)}
        onSuccess={() => {
          // Reload user data
          const updatedUser = userStorage.getCurrent();
          setUser(updatedUser);
        }}
      />
    </div>
  );
}
