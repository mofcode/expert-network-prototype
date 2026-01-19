// Local Storage utilities for Expert Network prototype

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
}

export interface Opportunity {
  id: string;
  type: 'call' | 'influencer' | 'research';
  title: string;
  description: string;
  payment: number;
  status: 'pending' | 'accepted' | 'completed';
  dueDate?: string;
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
};

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
    return transcripts.filter(t => {
      const matchesQuery = query === '' ||
        t.topic.toLowerCase().includes(query.toLowerCase()) ||
        t.content.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesCategory = !filters?.category || t.category === filters.category;
      const matchesRole = !filters?.role || t.expertRole === filters.role;

      return matchesQuery && matchesCategory && matchesRole;
    });
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
  // Run migration first to update existing data
  migrateSarahChenToSarahJames();
  
  // Check if data already exists
  if (expertStorage.getCurrent()) return;

  // Sample expert (Sarah - CRM Expert)
  const currentExpert: Expert = {
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

  expertStorage.setCurrent(currentExpert);

  // Sample transcripts
  const sampleTranscripts: Transcript[] = [
    {
      id: 't1',
      expertId: 'exp-001',
      expertName: 'Alex Rodriguez',
      expertRole: 'VP Data Engineering',
      topic: 'Databricks vs Snowflake: Cost considerations at scale',
      category: 'Data Infrastructure',
      date: '2024-12-10',
      duration: '22 min',
      content: 'Cost overruns became an issue at 50+ TB scale. We saw Databricks pricing become unpredictable with auto-scaling, while Snowflake offered more consistent per-query costs...',
      keyInsights: [
        'Cost overruns at 50+ TB scale',
        'Auto-scaling pricing unpredictability',
        'Query-based pricing more transparent'
      ],
      tags: ['Databricks', 'Snowflake', 'Cost Management', 'Data Warehouse'],
      upvotes: 23,
      citations: 8,
    },
    {
      id: 't2',
      expertId: 'exp-002',
      expertName: 'Maria Santos',
      expertRole: 'VP Marketing',
      topic: 'Salesforce to HubSpot migration: Common pitfalls',
      category: 'CRM Systems',
      date: '2024-11-28',
      duration: '18 min',
      content: 'The biggest mistake teams make is underestimating data mapping complexity. Historical data doesn\'t always translate cleanly...',
      keyInsights: [
        'Data mapping is more complex than expected',
        'Custom objects need careful planning',
        'API limitations can slow migration'
      ],
      tags: ['Salesforce', 'HubSpot', 'Migration', 'CRM'],
      upvotes: 31,
      citations: 12,
    },
    {
      id: 't3',
      expertId: 'exp-003',
      expertName: 'James Kim',
      expertRole: 'RevOps Director',
      topic: 'Usage-based pricing strategies for SaaS products',
      category: 'SaaS Pricing',
      date: '2024-12-05',
      duration: '25 min',
      content: 'Usage-based pricing works best when the value metric directly correlates to customer success. For example, charging per API call makes sense if API usage drives customer ROI...',
      keyInsights: [
        'Value metric must align with customer success',
        'Predictability matters for enterprise buyers',
        'Hybrid models reduce adoption friction'
      ],
      tags: ['Pricing', 'SaaS', 'Usage-based', 'Revenue'],
      upvotes: 42,
      citations: 15,
    },
  ];

  transcriptStorage.setAll(sampleTranscripts);

  // Sample opportunities
  const sampleOpportunities: Opportunity[] = [
    {
      id: 'opp-1',
      type: 'call',
      title: 'CRM Migration Strategy Call',
      description: 'Investor wants to discuss HubSpot vs Salesforce for mid-market companies',
      payment: 400,
      status: 'pending',
    },
    {
      id: 'opp-2',
      type: 'influencer',
      title: 'HubSpot Academy Video Series',
      description: 'Record 3 expert videos about marketing automation best practices',
      payment: 2000,
      status: 'pending',
      dueDate: '2025-02-15',
    },
    {
      id: 'opp-3',
      type: 'call',
      title: 'SaaS Pricing Workshop',
      description: 'Consult on pricing strategy for new product launch',
      payment: 400,
      status: 'pending',
    },
  ];

  opportunityStorage.setAll(sampleOpportunities);

  // Sample peer conversation
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
          message: 'Maria, you mentioned hybrid models. Can you share more about what you\'ve seen work in your experience?',
          timestamp: new Date().toISOString(),
          isAIPrompt: true,
        },
      ],
      status: 'active',
      willBePublished: true,
    },
  ];

  conversationStorage.setAll(sampleConversations);
};
