// Local Storage utilities for Expert Network prototype
import { sampleTranscripts } from './sample-transcripts';

export interface ExpertProfile {
  id: string;
  role: string;
  company: string;
  expertise: string[];
  contributions: number;
  badge: 'Active Expert' | 'Verified Expert' | 'Top Contributor' | 'Domain Authority';
  joinedDate: string;
  earnings: {
    calls: number;
    royalties: number;
    influencer: number;
    total: number;
  };
  stats: {
    transcripts: number;
    citations: number;
    upvotes: number;
  };
}

export interface SeekerProfile {
  id: string;
  company: string;
  role: string;
  interests: string[];
  savedTranscripts: string[];
  postedOpportunities: string[];
  bookings: string[];
  joinedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  profiles: {
    expert?: ExpertProfile;
    seeker?: SeekerProfile;
  };
  activeProfileType: 'expert' | 'seeker';
}

// Legacy Expert interface for backward compatibility
export interface Expert {
  id: string;
  name: string;
  role: string;
  company: string;
  expertise: string[];
  contributions: number;
  badge: 'Active Expert' | 'Verified Expert' | 'Top Contributor' | 'Domain Authority';
  joinedDate: string;
  earnings: {
    calls: number;
    royalties: number;
    influencer: number;
    total: number;
  };
  stats: {
    transcripts: number;
    citations: number;
    upvotes: number;
  };
}

export interface Transcript {
  id: string;
  expertId: string;
  expertName: string;
  expertRole: string;
  topic: string;
  category: string;
  date: string;
  duration: string;
  content: string;
  keyInsights: string[];
  tags: string[];
  upvotes: number;
  citations: number;
  coordinates?: {
    technical: number;     // -1 (Technical) to 1 (Business)
    strategic: number;     // -1 (Tactical) to 1 (Strategic)
  };
  aiMetadata?: {
    coordinatesGeneratedAt: string;
  };
}

export interface Opportunity {
  id: string;
  type: 'call' | 'influencer' | 'research';
  title: string;
  description: string;
  payment: number;
  status: 'pending' | 'accepted' | 'completed';
  dueDate?: string;
  postedBy?: string;
  seekerName?: string;
  targetExpertise?: string[];
  createdAt: string;
}

export interface ExpertBooking {
  id: string;
  seekerId: string;
  seekerName: string;
  expertId: string;
  expertName: string;
  expertRole: string;
  topic: string;
  description: string;
  duration: number;
  proposedTimes: string[];
  selectedTime?: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  payment: number;
  createdAt: string;
}

export interface PeerConversation {
  id: string;
  topic: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    expertise: string;
  }>;
  messages: Array<{
    participantId: string;
    participantName: string;
    message: string;
    timestamp: string;
    isAIPrompt?: boolean;
  }>;
  status: 'active' | 'completed';
  willBePublished: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  CURRENT_EXPERT: 'expert_network_current_expert',
  EXPERTS: 'expert_network_experts',
  TRANSCRIPTS: 'expert_network_transcripts',
  OPPORTUNITIES: 'expert_network_opportunities',
  CONVERSATIONS: 'expert_network_conversations',
  CURRENT_USER: 'expert_network_current_user',
  USERS: 'expert_network_users',
  BOOKINGS: 'expert_network_bookings',
  DATA_VERSION: 'expert_network_data_version',
};

const CURRENT_DATA_VERSION = '2.6'; // Increment to force data reset

// Generic storage functions
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Specific data access functions
export const expertStorage = {
  getCurrent: (): Expert | null => storage.get<Expert>(STORAGE_KEYS.CURRENT_EXPERT),
  setCurrent: (expert: Expert) => storage.set(STORAGE_KEYS.CURRENT_EXPERT, expert),
  getAll: (): Expert[] => storage.get<Expert[]>(STORAGE_KEYS.EXPERTS) || [],
  setAll: (experts: Expert[]) => storage.set(STORAGE_KEYS.EXPERTS, experts),
};

export const transcriptStorage = {
  getAll: (): Transcript[] => storage.get<Transcript[]>(STORAGE_KEYS.TRANSCRIPTS) || [],
  setAll: (transcripts: Transcript[]) => storage.set(STORAGE_KEYS.TRANSCRIPTS, transcripts),
  getById: (id: string): Transcript | null => {
    const transcripts = transcriptStorage.getAll();
    return transcripts.find(t => t.id === id) || null;
  },
  search: (query: string, filters?: { category?: string; role?: string }): Transcript[] => {
    const transcripts = transcriptStorage.getAll();
    console.log('[transcriptStorage.search] Query:', query, 'Transcripts:', transcripts.length);

    const results = transcripts.filter(t => {
      const matchesQuery = query === '' ||
        t.topic.toLowerCase().includes(query.toLowerCase()) ||
        t.content.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesCategory = !filters?.category || t.category === filters.category;
      const matchesRole = !filters?.role || t.expertRole === filters.role;

      const matches = matchesQuery && matchesCategory && matchesRole;

      if (!matches && query.toLowerCase().includes('crm')) {
        console.log('[transcriptStorage.search] Testing transcript:', {
          topic: t.topic,
          topicMatch: t.topic.toLowerCase().includes(query.toLowerCase()),
          contentMatch: t.content.toLowerCase().includes(query.toLowerCase()),
          tagMatch: t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        });
      }

      return matches;
    });

    console.log('[transcriptStorage.search] Results:', results.length);
    return results;
  },
};

export const opportunityStorage = {
  getAll: (): Opportunity[] => storage.get<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES) || [],
  setAll: (opportunities: Opportunity[]) => storage.set(STORAGE_KEYS.OPPORTUNITIES, opportunities),
  getPending: (): Opportunity[] => {
    return opportunityStorage.getAll().filter(o => o.status === 'pending');
  },
};

export const conversationStorage = {
  getAll: (): PeerConversation[] => storage.get<PeerConversation[]>(STORAGE_KEYS.CONVERSATIONS) || [],
  setAll: (conversations: PeerConversation[]) => storage.set(STORAGE_KEYS.CONVERSATIONS, conversations),
  getById: (id: string): PeerConversation | null => {
    const conversations = conversationStorage.getAll();
    return conversations.find(c => c.id === id) || null;
  },
  addMessage: (conversationId: string, message: PeerConversation['messages'][0]) => {
    const conversations = conversationStorage.getAll();
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.messages.push(message);
      conversationStorage.setAll(conversations);
    }
  },
};

export const userStorage = {
  getCurrent: (): User | null => storage.get<User>(STORAGE_KEYS.CURRENT_USER),
  setCurrent: (user: User) => storage.set(STORAGE_KEYS.CURRENT_USER, user),
  getAll: (): User[] => storage.get<User[]>(STORAGE_KEYS.USERS) || [],
  setAll: (users: User[]) => storage.set(STORAGE_KEYS.USERS, users),
  getById: (id: string): User | null => {
    const users = userStorage.getAll();
    return users.find(u => u.id === id) || null;
  },
};

export const bookingStorage = {
  getAll: (): ExpertBooking[] => storage.get<ExpertBooking[]>(STORAGE_KEYS.BOOKINGS) || [],
  setAll: (bookings: ExpertBooking[]) => storage.set(STORAGE_KEYS.BOOKINGS, bookings),
  getById: (id: string): ExpertBooking | null => {
    const bookings = bookingStorage.getAll();
    return bookings.find(b => b.id === id) || null;
  },
  getByExpertId: (expertId: string): ExpertBooking[] => {
    const bookings = bookingStorage.getAll();
    return bookings.filter(b => b.expertId === expertId);
  },
  getBySeekerId: (seekerId: string): ExpertBooking[] => {
    const bookings = bookingStorage.getAll();
    return bookings.filter(b => b.seekerId === seekerId);
  },
};

// Migration function to update Sarah Chen to Sarah James in existing data
const migrateSarahChenToSarahJames = () => {
  // Update expert data
  const currentExpert = expertStorage.getCurrent();
  if (currentExpert && currentExpert.name === 'Sarah Chen') {
    currentExpert.name = 'Sarah James';
    expertStorage.setCurrent(currentExpert);
  }

  // Update conversation data
  const conversations = conversationStorage.getAll();
  let updated = false;
  conversations.forEach(conversation => {
    // Update participants
    conversation.participants.forEach(participant => {
      if (participant.name === 'Sarah Chen') {
        participant.name = 'Sarah James';
        updated = true;
      }
    });
    
    // Update messages
    conversation.messages.forEach(message => {
      if (message.participantName === 'Sarah Chen') {
        message.participantName = 'Sarah James';
        updated = true;
      }
      // Update message content that mentions "Sarah Chen"
      if (message.message.includes('Sarah Chen')) {
        message.message = message.message.replace(/Sarah Chen/g, 'Sarah James');
        updated = true;
      }
      // Update specific patterns that refer to Sarah
      if (message.message.includes("Let's start with Sarah") && !message.message.includes('Sarah James')) {
        message.message = message.message.replace("Let's start with Sarah", "Let's start with Sarah James");
        updated = true;
      }
      if (message.message.includes('Great point, Sarah!') && !message.message.includes('Sarah James')) {
        message.message = message.message.replace('Great point, Sarah!', 'Great point, Sarah James!');
        updated = true;
      }
      if (message.message.includes('I agree with Sarah') && !message.message.includes('Sarah James')) {
        message.message = message.message.replace('I agree with Sarah', 'I agree with Sarah James');
        updated = true;
      }
    });
  });
  
  if (updated) {
    conversationStorage.setAll(conversations);
  }
};

// Initialize with sample data
export const initializeSampleData = () => {
  // Check data version and clear if outdated
  const storedVersion = storage.get<string>(STORAGE_KEYS.DATA_VERSION);
  if (storedVersion !== CURRENT_DATA_VERSION) {
    console.log('[initializeSampleData] Data version mismatch, clearing storage...');
    // Clear all data except transcripts (they're expensive to reload)
    storage.remove(STORAGE_KEYS.CURRENT_USER);
    storage.remove(STORAGE_KEYS.USERS);
    storage.remove(STORAGE_KEYS.CURRENT_EXPERT);
    storage.remove(STORAGE_KEYS.OPPORTUNITIES);
    storage.remove(STORAGE_KEYS.BOOKINGS);
    storage.set(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
  }

  // Run migration first to update existing data
  migrateSarahChenToSarahJames();

  // Check if data already exists and has the new larger dataset
  const existingTranscripts = transcriptStorage.getAll();
  const hasNewDataset = existingTranscripts.length >= 80;

  // Check if any transcripts are missing expert names (old data format)
  const hasMissingNames = existingTranscripts.some(t => !t.expertName || t.expertName.trim() === '');

  // Check if we have users (new data structure)
  const existingUsers = userStorage.getAll();
  const hasUsers = existingUsers.length > 0;
  const currentUser = userStorage.getCurrent();

  // If we don't have users, create them
  if (!hasUsers) {
    console.log('[initializeSampleData] Creating sample users...');

    // Sarah James - Expert only
    const sarahUser: User = {
      id: 'sarah-1',
      name: 'Sarah James',
      email: 'sarah.james@techcorp.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      profiles: {
        expert: {
          id: 'expert-sarah-1',
          role: 'VP Marketing',
          company: 'TechCorp (500-1000 employees)',
          expertise: ['CRM Systems', 'Marketing Automation', 'SaaS GTM', 'HubSpot', 'Salesforce'],
          contributions: 12,
          badge: 'Active Expert',
          joinedDate: '2024-09-15',
          earnings: {
            calls: 1200,
            royalties: 340,
            influencer: 2000,
            total: 3540,
          },
          stats: {
            transcripts: 12,
            citations: 47,
            upvotes: 89,
          },
        },
      },
      activeProfileType: 'expert',
    };

    // Alex Thompson - Seeker only
    const alexUser: User = {
      id: 'alex-1',
      name: 'Alex Thompson',
      email: 'alex.thompson@startupco.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      profiles: {
        seeker: {
          id: 'seeker-alex-1',
          company: 'StartupCo',
          role: 'Product Manager',
          interests: ['CRM', 'Product Strategy', 'Pricing', 'User Research'],
          savedTranscripts: [],
          postedOpportunities: [],
          bookings: [],
          joinedDate: '2024-11-01',
        },
      },
      activeProfileType: 'seeker',
    };

    userStorage.setAll([sarahUser, alexUser]);
    userStorage.setCurrent(alexUser); // Start with Alex (seeker view)

    // Also set Sarah as current expert for backward compatibility
    const sarahExpert: Expert = {
      id: 'sarah-1',
      name: 'Sarah James',
      role: 'VP Marketing',
      company: 'TechCorp (500-1000 employees)',
      expertise: ['CRM Systems', 'Marketing Automation', 'SaaS GTM', 'HubSpot', 'Salesforce'],
      contributions: 12,
      badge: 'Active Expert',
      joinedDate: '2024-09-15',
      earnings: {
        calls: 1200,
        royalties: 340,
        influencer: 2000,
        total: 3540,
      },
      stats: {
        transcripts: 12,
        citations: 47,
        upvotes: 89,
      },
    };
    expertStorage.setCurrent(sarahExpert);
  } else if (!currentUser && hasUsers) {
    // If users exist but no current user is set, set Alex as current
    console.log('[initializeSampleData] Setting default current user...');
    const alex = existingUsers.find(u => u.id === 'alex-1');
    if (alex) {
      userStorage.setCurrent(alex);
    } else {
      // Fallback to first user
      userStorage.setCurrent(existingUsers[0]);
    }
  }

  // If expert exists and we have the new dataset and all have names, skip transcript initialization
  const shouldSkipTranscriptInit = hasNewDataset && !hasMissingNames;

  if (!shouldSkipTranscriptInit) {
    // Otherwise, reinitialize with new data
    if (hasMissingNames) {
      console.log('[initializeSampleData] Found transcripts with missing expert names, reinitializing data...');
    } else {
      console.log('[initializeSampleData] Initializing with 80+ transcripts...');
    }

    // Use imported sample transcripts (80+ transcripts from sample-transcripts.ts)
    console.log('[initializeSampleData] Loading', sampleTranscripts.length, 'transcripts');
    transcriptStorage.setAll(sampleTranscripts);
    console.log('[initializeSampleData] Transcripts loaded successfully');
  }

  // Initialize opportunities
  const existingOpportunities = opportunityStorage.getAll();
  if (existingOpportunities.length === 0) {
    console.log('[initializeSampleData] Creating sample opportunities...');
    const sampleOpportunities: Opportunity[] = [
      {
        id: 'opp-1',
        type: 'call',
        title: 'CRM Migration Strategy Call',
        description: 'Investor wants to discuss HubSpot vs Salesforce for mid-market companies',
        payment: 400,
        status: 'pending',
        dueDate: '2025-02-10',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'opp-2',
        type: 'influencer',
        title: 'HubSpot Academy Video Series',
        description: 'Record 3 expert videos about marketing automation best practices',
        payment: 2000,
        status: 'pending',
        dueDate: '2025-02-15',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'opp-3',
        type: 'call',
        title: 'Product Analytics Best Practices',
        description: 'Looking for expert insights on implementing product analytics for B2B SaaS',
        payment: 400,
        status: 'pending',
        dueDate: '2025-02-12',
        postedBy: 'alex-1',
        seekerName: 'Alex Thompson',
        targetExpertise: ['Product Analytics', 'B2B SaaS', 'Data Strategy'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'opp-4',
        type: 'research',
        title: 'Pricing Strategy Research',
        description: 'Share insights on SaaS pricing models and packaging strategies for mid-market',
        payment: 300,
        status: 'pending',
        postedBy: 'alex-1',
        seekerName: 'Alex Thompson',
        targetExpertise: ['Pricing', 'SaaS GTM', 'Revenue Strategy'],
        dueDate: '2025-02-20',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    opportunityStorage.setAll(sampleOpportunities);

    // Update Alex's posted opportunities
    const alex = userStorage.getById('alex-1');
    if (alex?.profiles.seeker) {
      alex.profiles.seeker.postedOpportunities = ['opp-3', 'opp-4'];
      const users = userStorage.getAll();
      const updatedUsers = users.map(u => u.id === 'alex-1' ? alex : u);
      userStorage.setAll(updatedUsers);
      if (userStorage.getCurrent()?.id === 'alex-1') {
        userStorage.setCurrent(alex);
      }
    }
  }

  // Initialize sample bookings
  const existingBookings = bookingStorage.getAll();
  if (existingBookings.length === 0) {
    console.log('[initializeSampleData] Creating sample bookings...');
    const sampleBookings: ExpertBooking[] = [
      {
        id: 'booking-1',
        seekerId: 'alex-1',
        seekerName: 'Alex Thompson',
        expertId: 'sarah-1',
        expertName: 'Sarah James',
        expertRole: 'VP Marketing',
        topic: 'CRM Selection for Growing Startup',
        description: 'Need guidance on choosing between HubSpot and Salesforce for our 50-person startup. Looking to understand implementation complexity and long-term scalability.',
        duration: 45,
        proposedTimes: [
          new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
          new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
          new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
        ],
        status: 'requested',
        payment: 400,
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      },
    ];

    bookingStorage.setAll(sampleBookings);

    // Update Alex's bookings
    const alex = userStorage.getById('alex-1');
    if (alex?.profiles.seeker) {
      alex.profiles.seeker.bookings = ['booking-1'];
      const users = userStorage.getAll();
      const updatedUsers = users.map(u => u.id === 'alex-1' ? alex : u);
      userStorage.setAll(updatedUsers);
      if (userStorage.getCurrent()?.id === 'alex-1') {
        userStorage.setCurrent(alex);
      }
    }
  }

  // Always update conversations to ensure we have the latest expanded version
  const sampleConversations: PeerConversation[] = [
      {
        id: 'conv-1',
        topic: 'How should we price AI features in 2026?',
        participants: [
          { id: 'sarah-1', name: 'Sarah James', role: 'VP Marketing', expertise: 'CRM & Marketing Automation' },
          { id: 'alex-1', name: 'Alex Rodriguez', role: 'RevOps Director', expertise: 'Revenue Operations' },
          { id: 'maria-1', name: 'Maria Santos', role: 'VP Product', expertise: 'SaaS Product Strategy' },
        ],
        messages: [
          {
            participantId: 'ai',
            participantName: 'AI Moderator',
            message: 'Welcome to today\'s expert conversation on AI feature pricing. Let\'s start with Sarah James - from your marketing perspective, what pricing model do you see working best for AI features?',
            timestamp: new Date().toISOString(),
            isAIPrompt: true,
          },
          {
            participantId: 'sarah-1',
            participantName: 'Sarah James',
            message: 'I think usage-based pricing makes the most sense for AI features because customers can start small and scale as they see value. But you need to make sure the pricing is predictable enough that they don\'t get bill shock.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'alex-1',
            participantName: 'Alex Rodriguez',
            message: 'I agree with Sarah James on predictability. We\'ve seen customers hesitate on pure consumption models. What about a hybrid - base fee for access plus usage tiers?',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'ai',
            participantName: 'AI Moderator',
            message: 'Maria, Alex mentioned hybrid models. Can you share more about what you\'ve seen work in your experience?',
            timestamp: new Date().toISOString(),
            isAIPrompt: true,
          },
          {
            participantId: 'maria-1',
            participantName: 'Maria Santos',
            message: 'From a product perspective, we\'ve had success with tiered pricing where the base tier includes limited AI calls per month, then you pay for overages. It gives customers confidence in their monthly spend while allowing flexibility. The key is making the included credits generous enough that most customers stay within them.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'sarah-1',
            participantName: 'Sarah James',
            message: 'That\'s a great point, Maria. We\'ve found that when customers understand exactly what they\'re getting - like "1000 AI-powered insights per month" - it\'s much easier to sell than vague consumption pricing. The transparency really helps with adoption.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'ai',
            participantName: 'AI Moderator',
            message: 'Alex, from a revenue operations standpoint, how do you handle the forecasting challenges with these hybrid models?',
            timestamp: new Date().toISOString(),
            isAIPrompt: true,
          },
          {
            participantId: 'alex-1',
            participantName: 'Alex Rodriguez',
            message: 'Forecasting is definitely more complex. We track usage patterns closely and segment customers by their consumption behavior. What we\'ve learned is that about 70% of customers stay within their plan limits, 20% consistently go over, and 10% barely use the feature. That 20% overage group is actually really valuable - they\'re power users who get tons of value.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'maria-1',
            participantName: 'Maria Santos',
            message: 'Exactly! Those power users are often your best advocates. We actually created a special "unlimited" tier specifically for them after seeing consistent overage patterns. It converted really well because they knew they needed more than the standard tier but wanted predictable costs.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'sarah-1',
            participantName: 'Sarah James',
            message: 'I love that approach. We\'ve also found that AI features work well as add-ons to existing plans. Customers who are already paying $99/month are much more willing to add a $29/month AI package than someone starting from zero. The incremental value is easier to justify.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'ai',
            participantName: 'AI Moderator',
            message: 'That\'s an interesting perspective on packaging. How do you all think about competitive positioning when it comes to AI pricing?',
            timestamp: new Date().toISOString(),
            isAIPrompt: true,
          },
          {
            participantId: 'alex-1',
            participantName: 'Alex Rodriguez',
            message: 'We track competitor pricing religiously. What\'s interesting is that the market hasn\'t standardized yet - some vendors include AI in their base price, others charge separately, and some use credits. There\'s definitely an opportunity to differentiate through pricing model, not just price point.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'maria-1',
            participantName: 'Maria Santos',
            message: 'Agreed. We initially tried to undercut competitors on price but found that customers associated lower prices with lower quality AI. We actually raised our prices and positioned as "premium AI" and conversion improved. Sometimes you need to price for perceived value, not just cost.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'sarah-1',
            participantName: 'Sarah James',
            message: 'That\'s a crucial lesson. We learned the same thing. The messaging around AI features matters just as much as the pricing. When we emphasized ROI and time savings rather than just "AI-powered," customers were willing to pay significantly more.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'ai',
            participantName: 'AI Moderator',
            message: 'This has been a great discussion. Any final thoughts on where you see AI pricing heading in the next 12-18 months?',
            timestamp: new Date().toISOString(),
            isAIPrompt: true,
          },
          {
            participantId: 'alex-1',
            participantName: 'Alex Rodriguez',
            message: 'I think we\'ll see more standardization around outcome-based pricing - pay for results rather than API calls. Like "pay per insight generated" rather than "pay per 1000 tokens." It\'s harder to implement but much easier for customers to understand value.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'maria-1',
            participantName: 'Maria Santos',
            message: 'I agree with Alex. We\'re also seeing demand for more flexible pricing - monthly vs annual, different tiers based on team size, enterprise vs SMB models. The key is making it easy for customers to start small and grow. Friction in pricing is one of the biggest conversion killers.',
            timestamp: new Date().toISOString(),
          },
          {
            participantId: 'sarah-1',
            participantName: 'Sarah James',
            message: 'Great points from both of you. I\'d add that transparency will be critical. Customers want to understand not just what they\'re paying for, but how their usage translates to costs. Companies that can clearly explain their AI pricing in simple terms will win in the market.',
            timestamp: new Date().toISOString(),
          },
        ],
        status: 'active',
        willBePublished: true,
      },
    ];

    conversationStorage.setAll(sampleConversations);
};
