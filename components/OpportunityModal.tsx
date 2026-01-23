'use client';

import { useEffect } from 'react';
import { Opportunity } from '@/lib/storage';
import { X } from 'lucide-react';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OpportunityModal({
  opportunity,
  isOpen,
  onClose,
}: OpportunityModalProps) {
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

  if (!isOpen || !opportunity) return null;

  const getTypeIcon = (type: string) => {
    if (type === 'call') return 'phone';
    if (type === 'influencer') return 'videocam';
    return 'assessment';
  };

  const getTypeLabel = (type: string) => {
    if (type === 'call') return 'Paid Call';
    if (type === 'influencer') return 'Influencer';
    return 'Research';
  };

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
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <span className="material-symbols-outlined text-2xl text-gray-700">
                  {getTypeIcon(opportunity.type)}
                </span>
                <span className="badge-secondary">
                  {getTypeLabel(opportunity.type)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {opportunity.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{opportunity.description}</p>
          </div>

          {/* Due Date */}
          {opportunity.dueDate && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Due Date</h3>
              <p className="text-sm text-gray-700">
                {new Date(opportunity.dueDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Additional Details based on type */}
          {opportunity.type === 'call' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Call Details</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Payment:</strong> ${opportunity.payment.toLocaleString()}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>45-60 minute consultation call</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Video or phone call based on your preference</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Payment released within 48 hours after call completion</span>
                </li>
              </ul>
            </div>
          )}

          {opportunity.type === 'influencer' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Campaign Details</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Payment:</strong> ${opportunity.payment.toLocaleString()}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Content will be reviewed before publication</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Payment upon completion and approval</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Usage rights retained by sponsor</span>
                </li>
              </ul>
            </div>
          )}

          {opportunity.type === 'research' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Research Details</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Payment:</strong> ${opportunity.payment.toLocaleString()}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Written responses or survey format</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Estimated completion time: 30-45 minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Responses may be published anonymously</span>
                </li>
              </ul>
            </div>
          )}

          {/* Actions - Pill Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-full transition-colors"
              onClick={onClose}
            >
              Decline
            </button>
            <button
              className="px-6 py-3 text-sm font-medium text-white bg-purple hover:bg-purple-dark rounded-full transition-colors"
              onClick={() => {
                // Handle accept action
                alert('Accept functionality to be implemented');
              }}
            >
              Accept Opportunity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
