'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Expert, Opportunity, expertStorage, opportunityStorage, initializeSampleData } from '@/lib/storage';
import Link from 'next/link';
import AskExpertAIWidget from '@/components/AskExpertAIWidget';

// Helper function to get real professional photos for experts
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

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash) % 1000;
  return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face&seed=${seed}`;
}

export default function ExpertHome() {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeSampleData();
    setExpert(expertStorage.getCurrent());
    setOpportunities(opportunityStorage.getPending());
  }, []);

  if (!mounted || !expert) {
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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {expert.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-600">
            {expert.role} • {expert.contributions} contributions • Member since {new Date(expert.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-label">Transcripts</div>
            <div className="stat-value">{expert.stats.transcripts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Citations</div>
            <div className="stat-value">{expert.stats.citations}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Upvotes</div>
            <div className="stat-value">{expert.stats.upvotes}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Earned</div>
            <div className="stat-value">${expert.earnings.total.toLocaleString()}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6 text-purple">
            {/* Profile Card */}
            <div className="card">
              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={getAvatarUrl(expert.name)}
                  alt={expert.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{expert.name}</h2>
                  <p className="text-sm text-gray-600 mb-2">{expert.role}</p>
                  <p className="text-sm text-gray-500">{expert.company}</p>
                </div>
                <span className="badge-primary">{expert.badge}</span>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="section-label mb-3">Expertise Areas</div>
                <div className="flex flex-wrap gap-2">
                  {expert.expertise.map((skill) => (
                    <span key={skill} className="badge-outline">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Library CTA */}
            <div className="card bg-gradient-to-br from-purple/5 to-purple/10 border-purple/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="section-label text-purple mb-2">PEER INSIGHTS</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Search 5,000+ Expert Transcripts
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Access the collective knowledge of your peers. Real conversations about CRM migrations,
                    pricing strategies, and implementation challenges.
                  </p>
                  <Link href="/library" className="btn-primary">
                    Explore Library →
                  </Link>
                </div>
              </div>
            </div>

            {/* Opportunities */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Opportunities</h2>
                  <p className="text-sm text-gray-600 mt-1">{opportunities.length} pending offers</p>
                </div>
              </div>

              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="border border-gray-200 rounded-xl p-4 hover:border-purple/50 transition-colors accent-border-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="material-symbols-outlined text-xl text-gray-700">
                            {opp.type === 'call' ? 'phone' : opp.type === 'influencer' ? 'videocam' : 'assessment'}
                          </span>
                          <span className="badge-secondary">
                            {opp.type === 'call' ? 'Paid Call' : opp.type === 'influencer' ? 'Influencer' : 'Research'}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{opp.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{opp.description}</p>
                        {opp.dueDate && (
                          <p className="text-xs text-gray-500">
                            Due: {new Date(opp.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-gray-900 mb-2">${opp.payment}</div>
                        <button className="btn-secondary text-xs px-4 py-2">
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Ask Expert AI Widget */}
            <AskExpertAIWidget />

            {/* Coming Soon Card */}
            <div className="card bg-gray-100 border-gray-300">
              <div className="section-label mb-4">COMING SOON</div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Expert call history & analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Early access to research reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>LinkedIn influencer opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Personal knowledge repository</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
