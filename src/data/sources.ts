export interface Source {
  id: string;
  sourceName: string;
  sourceLogoUrl: string;
  originalTitle: string;
  originalUrl: string;
  author: string;
  publishedAt: string;
  shortDescription?: string;
  type?: 'News' | 'Blog' | 'Report' | 'Press Release';
  score?: number; // relevance score 0-100
}

export interface ArticleSources {
  articleId: string;
  sources: Source[];
}

// Mock data for the Sources feature
export const mockArticleSources: Record<string, Source[]> = {
  '1': [ // GPT-5 article
    {
      id: 's1',
      sourceName: 'The Verge',
      sourceLogoUrl: 'https://logo.clearbit.com/theverge.com',
      originalTitle: 'OpenAI Unveils GPT-5: The Most Capable AI Model Yet With Revolutionary Reasoning Abilities',
      originalUrl: 'https://www.theverge.com/openai-gpt5',
      author: 'Alex Chen',
      publishedAt: '2025-02-04T10:30:00Z',
      shortDescription: 'OpenAI releases GPT-5 with enhanced reasoning and multimodal capabilities.',
      type: 'News',
      score: 95,
    },
    {
      id: 's2',
      sourceName: 'Wired',
      sourceLogoUrl: 'https://logo.clearbit.com/wired.com',
      originalTitle: 'GPT-5 Thinks in Chains: How OpenAI Solved Multi-Step Reasoning',
      originalUrl: 'https://www.wired.com/gpt-5-reasoning',
      author: 'Sarah Zhang',
      publishedAt: '2025-02-04T08:15:00Z',
      shortDescription: 'Deep dive into the chain-of-thought architecture powering GPT-5.',
      type: 'News',
      score: 88,
    },
    {
      id: 's3',
      sourceName: 'TechCrunch',
      sourceLogoUrl: 'https://logo.clearbit.com/techcrunch.com',
      originalTitle: 'OpenAI API Gets Major Update With GPT-5: What Developers Need to Know',
      originalUrl: 'https://techcrunch.com/gpt-5-api-developers',
      author: 'Mike Butcher',
      publishedAt: '2025-02-04T06:00:00Z',
      shortDescription: 'New API features, pricing tiers, and developer tools for GPT-5.',
      type: 'News',
      score: 82,
    },
  ],
  '2': [ // Apple Vision Pro article
    {
      id: 's4',
      sourceName: 'MacRumors',
      sourceLogoUrl: 'https://logo.clearbit.com/macrumors.com',
      originalTitle: 'Apple Vision Pro 2 Enters Mass Production Ahead of Worldwide Launch',
      originalUrl: 'https://www.macrumors.com/vision-pro-2',
      author: 'Sarah Kim',
      publishedAt: '2025-02-04T09:15:00Z',
      shortDescription: 'Lighter design, improved displays, and more accessible pricing.',
      type: 'News',
      score: 98,
    },
    {
      id: 's5',
      sourceName: '9to5Mac',
      sourceLogoUrl: 'https://logo.clearbit.com/9to5mac.com',
      originalTitle: 'Vision Pro 2: Everything We Know About Apple\\'s Next Headset',
      originalUrl: 'https://9to5mac.com/vision-pro-2-rumors',
      author: 'Ben Lovejoy',
      publishedAt: '2025-02-03T14:30:00Z',
      shortDescription: 'Complete guide to Vision Pro 2 features and specifications.',
      type: 'News',
      score: 75,
    },
  ],
  '3': [ // Tesla Robotaxi article
    {
      id: 's6',
      sourceName: 'Electrek',
      sourceLogoUrl: 'https://logo.clearbit.com/electrek.co',
      originalTitle: 'Tesla Robotaxi Fleet Begins Operating in Austin, Marking Historic Autonomous Milestone',
      originalUrl: 'https://electrek.co/tesla-robotaxi',
      author: 'Fred Lambert',
      publishedAt: '2025-02-04T08:00:00Z',
      shortDescription: 'First commercial robotaxi service launches in Austin, Texas.',
      type: 'News',
      score: 94,
    },
    {
      id: 's7',
      sourceName: 'The Verge',
      sourceLogoUrl: 'https://logo.clearbit.com/theverge.com',
      originalTitle: 'Inside Tesla\\'s Robotaxi Launch: 50 Cars, No Drivers, Infinite Promise',
      originalUrl: 'https://www.theverge.com/tesla-robotaxi-austin',
      author: 'Andrew J. Hawkins',
      publishedAt: '2025-02-04T10:00:00Z',
      shortDescription: 'On the ground report from Tesla\\'s historic robotaxi debut.',
      type: 'News',
      score: 90,
    },
  ],
  '4': [ // Microsoft Discord article
    {
      id: 's8',
      sourceName: 'Bloomberg',
      sourceLogoUrl: 'https://logo.clearbit.com/bloomberg.com',
      originalTitle: 'Microsoft Acquires Discord for $25 Billion in Biggest Gaming Deal Since Activision',
      originalUrl: 'https://www.bloomberg.com/microsoft-discord',
      author: 'Jason Schreier',
      publishedAt: '2025-02-03T18:45:00Z',
      shortDescription: 'Discord to operate independently under Xbox and Teams.',
      type: 'News',
      score: 97,
    },
    {
      id: 's9',
      sourceName: 'The Verge',
      sourceLogoUrl: 'https://logo.clearbit.com/theverge.com',
      originalTitle: 'Microsoft\\'s Discord Deal: Why Gaming and Communities Matter More Than Ever',
      originalUrl: 'https://www.theverge.com/microsoft-discord-strategy',
      author: 'Nilay Patel',
      publishedAt: '2025-02-03T20:00:00Z',
      shortDescription: 'Analysis of Microsoft\\'s strategic reasoning behind the acquisition.',
      type: 'News',
      score: 85,
    },
  ],
  '5': [ // Claude 4 article
    {
      id: 's10',
      sourceName: 'MIT Technology Review',
      sourceLogoUrl: 'https://logo.clearbit.com/technologyreview.com',
      originalTitle: 'Anthropic\\'s Claude 4 Achieves Human-Level Performance on Graduate-Level Reasoning Tasks',
      originalUrl: 'https://www.technologyreview.com/claude-4',
      author: 'Dr. Emily Zhang',
      publishedAt: '2025-02-03T14:20:00Z',
      shortDescription: 'New benchmarks show Claude 4 surpasses human experts in physics and math.',
      type: 'News',
      score: 96,
    },
    {
      id: 's11',
      sourceName: 'Ars Technica',
      sourceLogoUrl: 'https://logo.clearbit.com/arstechnica.com',
      originalTitle: 'Claude 4\\'s Constitutional AI: How Safety and Capability Finally Coexist',
      originalUrl: 'https://arstechnica.com/claude-4-safety',
      author: 'Kevin Nguyen',
      publishedAt: '2025-02-03T12:00:00Z',
      shortDescription: 'Deep dive into Anthropic\\'s safety-first training approach.',
      type: 'News',
      score: 88,
    },
  ],
  '6': [ // SpaceX Starship article
    {
      id: 's12',
      sourceName: 'Ars Technica',
      sourceLogoUrl: 'https://logo.clearbit.com/arstechnica.com',
      originalTitle: 'SpaceX Starship Successfully Lands on Moon, Delivering First Commercial Payload',
      originalUrl: 'https://arstechnica.com/starship-moon',
      author: 'Eric Berger',
      publishedAt: '2025-02-03T11:00:00Z',
      shortDescription: 'Historic lunar landing proves commercial space transportation viability.',
      type: 'News',
      score: 98,
    },
  ],
  '7': [ // EU AI Act article
    {
      id: 's13',
      sourceName: 'TechCrunch',
      sourceLogoUrl: 'https://logo.clearbit.com/techcrunch.com',
      originalTitle: 'EU Passes Landmark AI Liability Act: Tech Giants Face Strict New Regulations',
      originalUrl: 'https://techcrunch.com/eu-ai-act',
      author: 'Natasha Lomas',
      publishedAt: '2025-02-02T16:30:00Z',
      shortDescription: '6% of global revenue fines for non-compliance with new AI laws.',
      type: 'News',
      score: 95,
    },
  ],
  '8': [ // DeepMind math article
    {
      id: 's14',
      sourceName: 'Wired',
      sourceLogoUrl: 'https://logo.clearbit.com/wired.com',
      originalTitle: 'Google DeepMind Solves 50-Year-Old Mathematical Conjecture Using AI',
      originalUrl: 'https://wired.com/deepmind-math',
      author: 'Karen Hao',
      publishedAt: '2025-02-02T12:15:00Z',
      shortDescription: 'AlphaProof discovers novel proof for Birch-Swinnerton-Dyer conjecture.',
      type: 'News',
      score: 99,
    },
    {
      id: 's15',
      sourceName: 'Nature',
      sourceLogoUrl: 'https://logo.clearbit.com/nature.com',
      originalTitle: 'AlphaProof: Reinforcement Learning in Formal Mathematics',
      originalUrl: 'https://nature.com/alphaproof',
      author: 'Dr. Terence Tao',
      publishedAt: '2025-02-02T10:00:00Z',
      shortDescription: 'Peer-reviewed research paper on DeepMind\\'s mathematical AI system.',
      type: 'Report',
      score: 92,
    },
  ],
};

// Helper functions
export const getSourcesByArticleId = (articleId: string): Source[] => {
  return mockArticleSources[articleId] || [];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 75) return 'text-yellow-600 bg-yellow-100';
  return 'text-gray-600 bg-gray-100';
};

export const getTypeBadgeClass = (type?: string): string => {
  switch (type) {
    case 'News':
      return 'bg-blue-100 text-blue-800';
    case 'Blog':
      return 'bg-purple-100 text-purple-800';
    case 'Report':
      return 'bg-orange-100 text-orange-800';
    case 'Press Release':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
