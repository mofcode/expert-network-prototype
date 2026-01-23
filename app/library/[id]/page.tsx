'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Transcript, transcriptStorage, initializeSampleData } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';
import UserProfileModal from '@/components/UserProfileModal';

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

// Helper to create user profile from expert name and role
function getUserProfile(name: string, role: string) {
  const expertiseMap: Record<string, string[]> = {
    'VP Marketing': ['Marketing Strategy', 'Brand Management', 'GTM Strategy', 'Content Marketing'],
    'CTO': ['Technology Strategy', 'System Architecture', 'Engineering Leadership', 'Cloud Infrastructure'],
    'VP Sales': ['Sales Strategy', 'Enterprise Sales', 'Revenue Operations', 'Team Leadership'],
    'CFO': ['Financial Planning', 'Corporate Finance', 'Strategic Planning', 'Risk Management'],
    'Product Manager': ['Product Strategy', 'Roadmap Planning', 'User Research', 'Data Analysis'],
    'Engineering Manager': ['Team Management', 'Technical Leadership', 'Agile Development', 'Hiring'],
  };

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

// Generate timestamped transcript from content
function generateTimestampedTranscript(content: string, expertName: string): Array<{ time: string; speaker: string; text: string }> {
  // Split content into sentences
  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const timestampedLines: Array<{ time: string; speaker: string; text: string }> = [];

  const interviewerQuestions = [
    'Thanks for joining us today. Can you start by telling us about your experience with this topic?',
    'That\'s really interesting. Can you elaborate on that?',
    'What were some of the key challenges you faced?',
    'How did that impact your overall strategy?',
    'Can you give us a specific example from your experience?',
    'What would you recommend to others in a similar situation?',
    'That makes sense. What happened next?',
    'How did your team respond to that?',
    'What lessons did you learn from that experience?',
    'Looking back, what would you do differently?',
    'How has this evolved over time?',
    'What metrics did you use to measure success?',
    'Can you walk us through your process?',
    'What surprised you the most about this?',
    'How did you communicate this to stakeholders?'
  ];

  // Generate timestamps and alternate between interviewer and expert
  let currentTime = 0;
  let buffer = '';
  let sentenceCount = 0;
  let questionIndex = 0;

  // Add opening from interviewer
  timestampedLines.push({
    time: '0:00',
    speaker: 'Interviewer',
    text: interviewerQuestions[questionIndex++]
  });
  currentTime = 15;

  // Go through sentences multiple times to create longer transcript
  const iterations = 3; // Repeat content 3 times for longer conversation

  for (let iteration = 0; iteration < iterations; iteration++) {
    sentences.forEach((sentence, index) => {
      buffer += sentence + ' ';
      sentenceCount++;

      // Create expert responses (2-3 sentences each)
      const shouldCreateEntry = sentenceCount >= 2 + Math.floor(Math.random() * 2);

      if (shouldCreateEntry) {
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        timestampedLines.push({
          time: timeString,
          speaker: expertName,
          text: buffer.trim()
        });

        buffer = '';
        sentenceCount = 0;
        currentTime += 20 + Math.floor(Math.random() * 15); // 20-35 seconds between entries

        // Add interviewer follow-up questions regularly
        if (Math.random() > 0.5 && questionIndex < interviewerQuestions.length) {
          const followUpTime = currentTime + 2;
          const followUpMinutes = Math.floor(followUpTime / 60);
          const followUpSeconds = followUpTime % 60;

          timestampedLines.push({
            time: `${followUpMinutes}:${followUpSeconds.toString().padStart(2, '0')}`,
            speaker: 'Interviewer',
            text: interviewerQuestions[questionIndex % interviewerQuestions.length]
          });

          questionIndex++;
          currentTime = followUpTime + 8;
        }
      }
    });

    // Add any remaining buffer at end of iteration
    if (buffer.trim().length > 0) {
      const minutes = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      timestampedLines.push({
        time: timeString,
        speaker: expertName,
        text: buffer.trim()
      });

      buffer = '';
      sentenceCount = 0;
      currentTime += 20 + Math.floor(Math.random() * 15);
    }
  }

  // Add closing question and response
  const closingTime = currentTime + 2;
  const closingMinutes = Math.floor(closingTime / 60);
  const closingSeconds = closingTime % 60;

  timestampedLines.push({
    time: `${closingMinutes}:${closingSeconds.toString().padStart(2, '0')}`,
    speaker: 'Interviewer',
    text: 'Thank you so much for sharing your insights with us today. This has been incredibly valuable.'
  });

  const finalTime = closingTime + 5;
  const finalMinutes = Math.floor(finalTime / 60);
  const finalSeconds = finalTime % 60;

  timestampedLines.push({
    time: `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`,
    speaker: expertName,
    text: 'My pleasure. Happy to help and share what we\'ve learned along the way.'
  });

  return timestampedLines;
}

export default function TranscriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<ReturnType<typeof getUserProfile> | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeSampleData();

    const id = params.id as string;
    const foundTranscript = transcriptStorage.getById(id);
    setTranscript(foundTranscript);
  }, [params.id]);

  if (!mounted || !transcript) {
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

  const timestampedTranscript = generateTimestampedTranscript(transcript.content, transcript.expertName);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="card">
          {/* Header */}
          <div className="mb-4">
            <span className="badge-purple">
              {transcript.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {transcript.topic}
          </h1>

          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
            <img
              src={getAvatarUrl(transcript.expertName)}
              alt={transcript.expertName}
              className="w-12 h-12 rounded-xl object-cover cursor-pointer hover:ring-2 hover:ring-purple transition-all"
              onClick={() => {
                setSelectedUserProfile(getUserProfile(transcript.expertName, transcript.expertRole));
                setIsProfileModalOpen(true);
              }}
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

          {/* Summary */}
          <div className="mb-6">
            <div className="section-label mb-3">SUMMARY</div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {transcript.content}
            </div>
          </div>

          {/* Full Transcript with Timestamps */}
          <div className="mb-6">
            <div className="section-label mb-4">FULL TRANSCRIPT</div>
            <div className="space-y-6">
              {timestampedTranscript.map((entry, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-xs font-mono text-gray-500 flex-shrink-0 mt-1 w-12">
                    {entry.time}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {entry.speaker}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))}
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
              <button className="btn-outline flex items-center space-x-2 text-sm px-4 py-2 flex-shrink-0">
                <span className="material-symbols-outlined text-base">thumb_up</span>
                <span>Upvote ({transcript.upvotes})</span>
              </button>
            </div>
          </div>
        </div>

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
