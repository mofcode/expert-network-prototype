'use client';

import { useState } from 'react';
import { opportunityStorage, userStorage, Opportunity } from '@/lib/storage';

interface PostOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (opportunity: Opportunity) => void;
}

type OpportunityType = 'call' | 'research' | 'influencer';

export default function PostOpportunityModal({ isOpen, onClose, onSuccess }: PostOpportunityModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<OpportunityType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetExpertise, setTargetExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [budget, setBudget] = useState('');
  const [dueDate, setDueDate] = useState('');

  const opportunityTypes = [
    {
      type: 'call' as OpportunityType,
      title: 'Paid Call',
      icon: 'phone',
      description: 'Schedule a 1-on-1 consultation with an expert',
      rateRange: '$300-500/hour',
    },
    {
      type: 'research' as OpportunityType,
      title: 'Research',
      icon: 'assessment',
      description: 'Request written insights or survey responses',
      rateRange: '$150-300',
    },
    {
      type: 'influencer' as OpportunityType,
      title: 'Influencer',
      icon: 'videocam',
      description: 'Commission content creation or public endorsements',
      rateRange: '$1,000-5,000',
    },
  ];

  const suggestedBudgets: Record<OpportunityType, number[]> = {
    call: [300, 400, 500],
    research: [150, 250, 300],
    influencer: [1000, 2000, 5000],
  };

  const handleTypeSelect = (type: OpportunityType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleAddExpertise = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && expertiseInput.trim()) {
      e.preventDefault();
      if (!targetExpertise.includes(expertiseInput.trim())) {
        setTargetExpertise([...targetExpertise, expertiseInput.trim()]);
      }
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (expertise: string) => {
    setTargetExpertise(targetExpertise.filter(e => e !== expertise));
  };

  const handleSubmit = () => {
    if (!selectedType || !title || !description || !budget) return;

    const user = userStorage.getCurrent();
    if (!user || !user.profiles.seeker) return;

    const newOpportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      type: selectedType,
      title,
      description,
      payment: parseFloat(budget),
      status: 'pending',
      postedBy: user.id,
      seekerName: user.name,
      targetExpertise: targetExpertise.length > 0 ? targetExpertise : undefined,
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    // Save opportunity
    const opportunities = opportunityStorage.getAll();
    opportunityStorage.setAll([...opportunities, newOpportunity]);

    // Update user's posted opportunities
    const updatedUser = {
      ...user,
      profiles: {
        ...user.profiles,
        seeker: {
          ...user.profiles.seeker,
          postedOpportunities: [...user.profiles.seeker.postedOpportunities, newOpportunity.id],
        },
      },
    };
    userStorage.setCurrent(updatedUser);

    const users = userStorage.getAll();
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    userStorage.setAll(updatedUsers);

    if (onSuccess) {
      onSuccess(newOpportunity);
    }

    // Reset and close
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setTitle('');
    setDescription('');
    setTargetExpertise([]);
    setExpertiseInput('');
    setBudget('');
    setDueDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Post an Opportunity</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Choose Opportunity Type</h3>
                <p className="text-sm text-gray-600">
                  Select the type of expert engagement you're looking for
                </p>
              </div>

              {opportunityTypes.map((oppType) => (
                <button
                  key={oppType.type}
                  onClick={() => handleTypeSelect(oppType.type)}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple hover:bg-purple/5 transition-all text-left"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl text-purple">
                        {oppType.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{oppType.title}</h4>
                        <span className="text-sm font-medium text-purple">{oppType.rateRange}</span>
                      </div>
                      <p className="text-sm text-gray-600">{oppType.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Details Form */}
          {step === 2 && selectedType && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Opportunity Details</h3>
                <p className="text-sm text-gray-600">
                  Provide details about what you're looking for
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., CRM Migration Strategy Consultation"
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
                  placeholder="Describe what you're looking for in 200-500 characters..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{description.length} characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Expertise (optional)
                </label>
                <input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={handleAddExpertise}
                  placeholder="Type expertise and press Enter (e.g., CRM, Salesforce)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none"
                />
                {targetExpertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {targetExpertise.map((expertise) => (
                      <span
                        key={expertise}
                        className="inline-flex items-center space-x-2 px-3 py-1 bg-purple/10 text-purple rounded-lg text-sm"
                      >
                        <span>{expertise}</span>
                        <button
                          onClick={() => handleRemoveExpertise(expertise)}
                          className="hover:text-purple-dark"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  {suggestedBudgets[selectedType].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBudget(amount.toString())}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        budget === amount.toString()
                          ? 'border-purple bg-purple text-white'
                          : 'border-gray-300 text-gray-700 hover:border-purple'
                      }`}
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Or enter custom amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple focus:ring-2 focus:ring-purple/20 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!title || !description || !budget || description.length < 50}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Post */}
          {step === 3 && selectedType && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Review & Post</h3>
                <p className="text-sm text-gray-600">
                  Review your opportunity before posting to the expert network
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">TYPE</div>
                  <div className="flex items-center space-x-2">
                    <span className="badge-secondary">
                      {opportunityTypes.find(t => t.type === selectedType)?.title}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">TITLE</div>
                  <div className="text-base font-semibold text-gray-900">{title}</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">DESCRIPTION</div>
                  <div className="text-sm text-gray-700">{description}</div>
                </div>

                {targetExpertise.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">REQUIRED EXPERTISE</div>
                    <div className="flex flex-wrap gap-2">
                      {targetExpertise.map((expertise) => (
                        <span key={expertise} className="badge-outline text-xs">
                          {expertise}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">PAYMENT</div>
                  <div className="text-2xl font-bold text-green">
                    ${parseFloat(budget).toLocaleString()}
                  </div>
                </div>

                {dueDate && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">DUE DATE</div>
                    <div className="text-sm text-gray-700">
                      {new Date(dueDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 btn-primary"
                >
                  Post to Network
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
