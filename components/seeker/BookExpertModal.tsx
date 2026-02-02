'use client';

import { useState, useEffect } from 'react';
import { bookingStorage, userStorage, transcriptStorage, ExpertBooking } from '@/lib/storage';

interface BookExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  expertId?: string;
  onSuccess?: (booking: ExpertBooking) => void;
}

interface ExpertOption {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatarUrl: string;
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

export default function BookExpertModal({ isOpen, onClose, expertId, onSuccess }: BookExpertModalProps) {
  const [step, setStep] = useState(expertId ? 2 : 1);
  const [selectedExpert, setSelectedExpert] = useState<ExpertOption | null>(null);
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [proposedTimes, setProposedTimes] = useState<string[]>(['', '', '']);

  useEffect(() => {
    if (isOpen) {
      // Load experts from transcripts
      const transcripts = transcriptStorage.getAll();
      const expertMap = new Map<string, ExpertOption>();

      transcripts.forEach(t => {
        const key = `${t.expertName}-${t.expertRole}`;
        if (!expertMap.has(key)) {
          expertMap.set(key, {
            id: t.expertId,
            name: t.expertName,
            role: t.expertRole,
            expertise: [],
            avatarUrl: getAvatarUrl(t.expertName),
          });
        }
        const expert = expertMap.get(key)!;
        if (t.category && !expert.expertise.includes(t.category)) {
          expert.expertise.push(t.category);
        }
      });

      const expertList = Array.from(expertMap.values());
      setExperts(expertList);

      // If expertId provided, select that expert
      if (expertId) {
        const expert = expertList.find(e => e.id === expertId);
        if (expert) {
          setSelectedExpert(expert);
          setStep(2);
        }
      }
    }
  }, [isOpen, expertId]);

  const durationOptions = [
    { minutes: 30, price: 300 },
    { minutes: 45, price: 400 },
    { minutes: 60, price: 500 },
  ];

  const filteredExperts = experts.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExpertSelect = (expert: ExpertOption) => {
    setSelectedExpert(expert);
    setStep(2);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...proposedTimes];
    newTimes[index] = value;
    setProposedTimes(newTimes);
  };

  const handleSubmit = () => {
    if (!selectedExpert || !topic || !description) return;

    const user = userStorage.getCurrent();
    if (!user || !user.profiles.seeker) return;

    const validTimes = proposedTimes.filter(t => t !== '');
    if (validTimes.length < 2) return;

    const selectedDuration = durationOptions.find(d => d.minutes === duration);
    if (!selectedDuration) return;

    const newBooking: ExpertBooking = {
      id: `booking-${Date.now()}`,
      seekerId: user.id,
      seekerName: user.name,
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      expertRole: selectedExpert.role,
      topic,
      description,
      duration,
      proposedTimes: validTimes,
      status: 'requested',
      payment: selectedDuration.price,
      createdAt: new Date().toISOString(),
    };

    // Save booking
    const bookings = bookingStorage.getAll();
    bookingStorage.setAll([...bookings, newBooking]);

    // Update user's bookings
    const updatedUser = {
      ...user,
      profiles: {
        ...user.profiles,
        seeker: {
          ...user.profiles.seeker,
          bookings: [...user.profiles.seeker.bookings, newBooking.id],
        },
      },
    };
    userStorage.setCurrent(updatedUser);

    const users = userStorage.getAll();
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    userStorage.setAll(updatedUsers);

    if (onSuccess) {
      onSuccess(newBooking);
    }

    // Reset and close
    handleClose();
  };

  const handleClose = () => {
    setStep(expertId ? 2 : 1);
    setSelectedExpert(null);
    setSearchQuery('');
    setTopic('');
    setDescription('');
    setDuration(45);
    setProposedTimes(['', '', '']);
    onClose();
  };

  if (!isOpen) return null;

  const selectedDurationOption = durationOptions.find(d => d.minutes === duration);
  const validTimesCount = proposedTimes.filter(t => t !== '').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Expert Call</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 4</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Select Expert */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select an Expert</h3>
                <p className="text-sm text-gray-600">
                  Choose which expert you'd like to book a call with
                </p>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experts by name or expertise..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredExperts.map((expert) => (
                  <button
                    key={expert.id}
                    onClick={() => handleExpertSelect(expert)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple hover:bg-purple/5 transition-all text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={expert.avatarUrl}
                        alt={expert.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900">{expert.name}</h4>
                        <p className="text-sm text-gray-600">{expert.role}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {expert.expertise.slice(0, 3).map((exp) => (
                            <span key={exp} className="badge-outline text-xs">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Topic & Details */}
          {step === 2 && selectedExpert && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Call Details</h3>
                <p className="text-sm text-gray-600">
                  What would you like to discuss with {selectedExpert.name}?
                </p>
              </div>

              {/* Selected Expert Card */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                <img
                  src={selectedExpert.avatarUrl}
                  alt={selectedExpert.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <div className="font-bold text-gray-900">{selectedExpert.name}</div>
                  <div className="text-sm text-gray-600">{selectedExpert.role}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., CRM Migration Strategy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what you'd like to cover in the call..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {durationOptions.map((option) => (
                    <button
                      key={option.minutes}
                      onClick={() => setDuration(option.minutes)}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        duration === option.minutes
                          ? 'border-purple bg-purple text-white'
                          : 'border-gray-300 hover:border-purple'
                      }`}
                    >
                      <div className="text-lg font-bold">{option.minutes} min</div>
                      <div className="text-sm mt-1">${option.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {!expertId && (
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => setStep(3)}
                  disabled={!topic || !description}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Propose Times */}
          {step === 3 && selectedExpert && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Propose Times</h3>
                <p className="text-sm text-gray-600">
                  Suggest 2-3 times that work for you. {selectedExpert.name} will confirm one of these.
                </p>
              </div>

              <div className="space-y-4">
                {proposedTimes.map((time, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option {index + 1} {index < 2 && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="datetime-local"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Note about timezones</p>
                    <p>Your timezone will be included with the booking request. The expert will confirm which time works best for them.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={validTimesCount < 2}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm & Book */}
          {step === 4 && selectedExpert && selectedDurationOption && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm & Book</h3>
                <p className="text-sm text-gray-600">
                  Review your booking details before submitting
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">EXPERT</div>
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedExpert.avatarUrl}
                      alt={selectedExpert.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{selectedExpert.name}</div>
                      <div className="text-sm text-gray-600">{selectedExpert.role}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">TOPIC</div>
                  <div className="text-base font-semibold text-gray-900">{topic}</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">DESCRIPTION</div>
                  <div className="text-sm text-gray-700">{description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">DURATION</div>
                    <div className="text-base font-semibold text-gray-900">{duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">PAYMENT</div>
                    <div className="text-2xl font-bold text-green">${selectedDurationOption.price}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">PROPOSED TIMES</div>
                  <div className="space-y-2">
                    {proposedTimes.filter(t => t !== '').map((time, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        {new Date(time).toLocaleString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 btn-primary"
                >
                  Request Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
