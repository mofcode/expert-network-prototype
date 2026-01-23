'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { PeerConversation, conversationStorage, initializeSampleData } from '@/lib/storage';

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

export default function PeerConversations() {
  const [conversation, setConversation] = useState<PeerConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeSampleData();
    const conversations = conversationStorage.getAll();
    if (conversations.length > 0) {
      setConversation(conversations[0]);
    }
  }, []);

  const handleSendMessage = () => {
    if (!conversation || !newMessage.trim()) return;

    const message: PeerConversation['messages'][0] = {
      participantId: 'sarah-1',
      participantName: 'Sarah James',
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    conversationStorage.addMessage(conversation.id, message);

    // Update local state
    setConversation({
      ...conversation,
      messages: [...conversation.messages, message],
    });

    setNewMessage('');

    // Simulate AI follow-up after a delay
    setTimeout(() => {
      const aiMessage: PeerConversation['messages'][0] = {
        participantId: 'ai',
        participantName: 'AI Moderator',
        message: `Great point, Sarah James! Alex, what's your take on that approach?`,
        timestamp: new Date().toISOString(),
        isAIPrompt: true,
      };

      conversationStorage.addMessage(conversation.id, aiMessage);

      setConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage],
      } : null);
    }, 2000);
  };

  if (!mounted || !conversation) {
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Peer-to-Peer Expert Conversation
              </h1>
              <p className="text-sm text-gray-600">
                Collaborate with fellow experts in structured conversations
              </p>
            </div>
            <span className={`badge ${
              conversation.status === 'active' ? 'badge-success' : 'badge-outline'
            }`}>
              {conversation.status === 'active' ? 'Active' : 'Completed'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Conversation Panel */}
          <div className="lg:col-span-3">
            {/* Topic Card */}
            <div className="card mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {conversation.topic}
                  </h2>
                  <p className="text-sm text-gray-600">
                    A collaborative discussion among {conversation.participants.length} experts
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {conversation.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <img
                        src={getAvatarUrl(participant.name)}
                        alt={participant.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{participant.name}</div>
                        <div className="text-xs text-gray-600 truncate">{participant.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="card">
              <div className="space-y-6 mb-6">
                {conversation.messages.map((message, idx) => (
                  <div key={idx} className={`flex ${message.isAIPrompt ? 'justify-center' : 'justify-start'}`}>
                    {message.isAIPrompt ? (
                      /* AI Moderator Message */
                      <div className="max-w-2xl">
                        <div className="rounded-lg p-4 border border-purple-20 bg-gradient-to-br from-purple-10 to-rorange-10">
                          <div className="flex items-center space-x-2 mb-2">
                            <img 
                              src="/ai-sparkle.svg" 
                              alt="AI Sparkle" 
                              className="w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-purple uppercase tracking-wider">AI Moderator</span>
                          </div>
                          <p className="text-sm text-gray-900 italic">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Expert Message */
                      <div className="max-w-3xl w-full">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {message.participantName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {conversation.status === 'active' && (
                <div className="pt-6 border-t border-gray-200">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your thoughts, Sarah..."
                    rows={3}
                    className="input"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-gray-500">
                      Be authentic and share real experiences
                    </p>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Notice */}
            <div className="card border-yellow/30 bg-yellow/5">
              <div className="mb-3">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Will Be Published
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                This conversation will be published to the Expert Library and made available to the community.
              </p>
            </div>

            {/* Guidelines */}
            <div className="card border-gray-500">
              <div className="section-label mb-4">Conversation Guidelines</div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="material-symbols-outlined mr-2 text-green text-base">check_circle</span>
                  <span>Share real experiences and specific examples</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined mr-2 text-green text-base">check_circle</span>
                  <span>Ask questions to other experts</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined mr-2 text-green text-base">check_circle</span>
                  <span>Build on others' insights</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined mr-2 text-rorange text-base">cancel</span>
                  <span>Share confidential company information</span>
                </li>
              </ul>
            </div>

            {/* Privacy Controls */}
            <div className="card">
              <div className="section-label mb-4">Privacy Controls</div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="custom-checkbox w-4 h-4 rounded focus:ring-purple/20 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    Publish anonymously
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="custom-checkbox w-4 h-4 rounded focus:ring-purple/20 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    Hide company name
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="custom-checkbox w-4 h-4 rounded focus:ring-purple/20 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    Review before publishing
                  </span>
                </label>
              </div>
            </div>

            {/* AI Assistant Info */}
            <div className="card bg-purple/5 border-purple/20">
              <div className="mb-3">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  AI Moderator Active
                </h3>
              </div>
              <p className="text-sm text-gray-700">
                The AI will guide the conversation with thoughtful questions and help keep discussions on track.
              </p>
            </div>

            {/* Conversation Stats */}
            <div className="card">
              <div className="section-label mb-4">Conversation Stats</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Messages</span>
                  <span className="text-base font-bold text-gray-900">
                    {conversation.messages.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Participants</span>
                  <span className="text-base font-bold text-gray-900">
                    {conversation.participants.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Status</span>
                  <span className="badge-success text-xs">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Leave Conversation */}
            <button className="btn-outline w-full">
              Leave Conversation
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
