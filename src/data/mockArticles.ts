export interface Article {
  id: string;
  originalTitle: string;
  aiSummary: string;
  originalAuthor: string;
  sourcePublication: string;
  sourceUrl: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  tags: string[];
  originalReadTime: number; // in minutes
  siftedReadTime: number; // in minutes
  publishedAt: string;
  isFeatured?: boolean;
}

export const mockArticles: Article[] = [
  {
    id: '1',
    originalTitle: 'OpenAI Unveils GPT-5: The Most Capable AI Model Yet With Revolutionary Reasoning Abilities',
    aiSummary: 'OpenAI released GPT-5, their most advanced language model featuring enhanced reasoning capabilities and multimodal understanding. The model demonstrates significant improvements in complex problem-solving and can process images, audio, and text simultaneously.',
    originalAuthor: 'Alex Chen',
    sourcePublication: 'The Verge',
    sourceUrl: 'https://theverge.com/openai-gpt5',
    mediaUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop',
    mediaType: 'image',
    tags: ['AI', 'OpenAI', 'GPT-5'],
    originalReadTime: 14,
    siftedReadTime: 2,
    publishedAt: '2025-02-04T10:30:00Z',
    isFeatured: true,
  },
  {
    id: '2',
    originalTitle: 'Apple Vision Pro 2 Enters Mass Production Ahead of Worldwide Launch',
    aiSummary: 'Apple has begun mass production of Vision Pro 2, featuring a lighter design and improved display technology. The device is expected to launch globally in Q3 with a more accessible price point.',
    originalAuthor: 'Sarah Kim',
    sourcePublication: 'MacRumors',
    sourceUrl: 'https://macrumors.com/vision-pro-2',
    mediaUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&h=600&fit=crop',
    mediaType: 'image',
    tags: ['Apple', 'VR', 'Hardware'],
    originalReadTime: 8,
    siftedReadTime: 1,
    publishedAt: '2025-02-04T09:15:00Z',
  },
  {
    id: '3',
    originalTitle: 'Tesla Robotaxi Fleet Begins Operating in Austin, Marking Historic Autonomous Milestone',
    aiSummary: 'Tesla launched its first commercial robotaxi service in Austin, Texas. The fleet operates 24/7 with zero human intervention, using the latest FSD v14 software. Initial rides are free during the pilot phase.',
    originalAuthor: 'Mike Rodriguez',
    sourcePublication: 'Electrek',
    sourceUrl: 'https://electrek.co/tesla-robotaxi',
    mediaUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop',
    mediaType: 'image',
    tags: ['Tesla', 'Autonomous', 'EVs'],
    originalReadTime: 11,
    siftedReadTime: 2,
    publishedAt: '2025-02-04T08:00:00Z',
  },
  {
    id: '4',
    originalTitle: 'Microsoft Acquires Discord for $25 Billion in Biggest Gaming Deal Since Activision',
    aiSummary: 'Microsoft confirmed acquisition of Discord, integrating the platform into Xbox and Teams ecosystems. The deal preserves Discord\'s independence while adding AI-powered features and enterprise capabilities.',
    originalAuthor: 'Jason Schreier',
    sourcePublication: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com/microsoft-discord',
    mediaUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=600&fit=crop',
    mediaType: 'image',
    tags: ['Microsoft', 'Discord', 'Acquisition'],
    originalReadTime: 9,
    siftedReadTime: 2,
    publishedAt: '2025-02-03T18:45:00Z',
  },
  {
    id: '5',
    originalTitle: 'Anthropic\'s Claude 4 Achieves Human-Level Performance on Graduate-Level Reasoning Tasks',
    aiSummary: 'Claude 4 sets new benchmarks in logical reasoning and mathematical problem-solving. The model demonstrates unprecedented accuracy on PhD-level physics and mathematics exams, surpassing human expert performance.',
    originalAuthor: 'Dr. Emily Zhang',
    sourcePublication: 'MIT Technology Review',
    sourceUrl: 'https://technologyreview.com/claude-4',
    mediaUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop',
    mediaType: 'image',
    tags: ['AI', 'Anthropic', 'Research'],
    originalReadTime: 16,
    siftedReadTime: 3,
    publishedAt: '2025-02-03T14:20:00Z',
  },
  {
    id: '6',
    originalTitle: 'SpaceX Starship Successfully Lands on Moon, Delivering First Commercial Payload',
    aiSummary: 'SpaceX\'s Starship completed its first lunar landing, delivering scientific instruments for NASA\'s Artemis program. The mission proves the viability of commercial lunar transportation.',
    originalAuthor: 'Eric Berger',
    sourcePublication: 'Ars Technica',
    sourceUrl: 'https://arstechnica.com/starship-moon',
    mediaUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&h=600&fit=crop',
    mediaType: 'image',
    tags: ['SpaceX', 'NASA', 'Space'],
    originalReadTime: 12,
    siftedReadTime: 2,
    publishedAt: '2025-02-03T11:00:00Z',
  },
  {
    id: '7',
    originalTitle: 'EU Passes Landmark AI Liability Act: Tech Giants Face Strict New Regulations',
    aiSummary: 'The European Union approved comprehensive AI liability laws requiring companies to prove their systems are safe. Violations can result in fines up to 6% of global revenue.',
    originalAuthor: 'Natasha Lomas',
    sourcePublication: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/eu-ai-act',
    mediaUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop',
    mediaType: 'image',
    tags: ['Regulation', 'EU', 'Policy'],
    originalReadTime: 10,
    siftedReadTime: 2,
    publishedAt: '2025-02-02T16:30:00Z',
  },
  {
    id: '8',
    originalTitle: 'Google DeepMind Solves 50-Year-Old Mathematical Conjecture Using AI',
    aiSummary: 'DeepMind\'s new AlphaProof system solved the Riemann-related conjecture that mathematicians couldn\'t crack for decades. The breakthrough demonstrates AI\'s potential in pure mathematics research.',
    originalAuthor: 'Karen Hao',
    sourcePublication: 'Wired',
    sourceUrl: 'https://wired.com/deepmind-math',
    mediaUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    mediaType: 'image',
    tags: ['DeepMind', 'Mathematics', 'Research'],
    originalReadTime: 13,
    siftedReadTime: 2,
    publishedAt: '2025-02-02T12:15:00Z',
  },
];

export const getArticleById = (id: string): Article | undefined => {
  return mockArticles.find(article => article.id === id);
};

export const getFeaturedArticle = (): Article | undefined => {
  return mockArticles.find(article => article.isFeatured);
};

export const getRegularArticles = (): Article[] => {
  return mockArticles.filter(article => !article.isFeatured);
};
