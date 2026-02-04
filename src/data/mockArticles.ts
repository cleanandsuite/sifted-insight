export interface ArticleSummary {
  keyPoints: string[];
  analysis: string;
  takeaways: string[];
}

export interface Article {
  id: string;
  originalTitle: string;
  aiSummary: string;
  summaryTabs: ArticleSummary;
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
    summaryTabs: {
      keyPoints: [
        'GPT-5 introduces a new "deep reasoning" mode that can solve multi-step problems with unprecedented accuracy',
        'The model can process images, audio, and text simultaneously in a unified context window',
        'Response latency reduced by 40% compared to GPT-4 Turbo while maintaining quality',
        'New safety measures include built-in fact-checking and source attribution'
      ],
      analysis: 'This release marks a significant leap in AI capabilities, particularly in reasoning and multimodal understanding. The deep reasoning mode suggests OpenAI is moving toward systems that can tackle complex, real-world problems requiring multiple steps of logical deduction. The improved latency makes the model more practical for production applications.',
      takeaways: [
        'Developers should prepare for API changes and new pricing tiers',
        'Multimodal capabilities open doors for new application categories',
        'Enterprise adoption likely to accelerate with improved safety features'
      ]
    },
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
    summaryTabs: {
      keyPoints: [
        'Weight reduced by 30% through new carbon fiber and titanium alloy construction',
        'Display resolution increased to 4K per eye with improved HDR',
        'Battery life extended to 4 hours of continuous use',
        'Price expected to start at $2,499, down from $3,499'
      ],
      analysis: 'Apple is addressing the two biggest criticisms of the original Vision Pro: weight and price. The significant weight reduction should make extended use more comfortable, while the lower price point could expand the market beyond early adopters and enterprise customers.',
      takeaways: [
        'Existing Vision Pro apps will be compatible with new hardware',
        'Lower price may trigger competitive responses from Meta and others',
        'Enterprise adoption expected to accelerate with improved comfort'
      ]
    },
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
    summaryTabs: {
      keyPoints: [
        'Fleet of 50 Model 3 vehicles operating without safety drivers in designated zones',
        'FSD v14 achieves 99.99% safety rating in internal testing over 10 million miles',
        'Service available via Tesla app with average wait times under 5 minutes',
        'Free rides during 90-day pilot phase, then competitive pricing with Uber/Lyft'
      ],
      analysis: 'This launch represents a pivotal moment for autonomous vehicles. Tesla\'s decision to operate without safety drivers signals confidence in FSD v14\'s reliability. The limited geographic rollout allows controlled testing while building regulatory trust for broader expansion.',
      takeaways: [
        'Uber and Lyft stocks may face pressure as autonomous competition materializes',
        'Insurance and liability frameworks will be tested in real-world scenarios',
        'Success in Austin could accelerate approvals in other cities'
      ]
    },
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
    summaryTabs: {
      keyPoints: [
        'Discord to operate as independent subsidiary, maintaining its brand and culture',
        'Xbox Game Pass integration will include Discord voice chat and community features',
        'Microsoft Teams getting Discord-style servers for enterprise collaboration',
        'AI-powered moderation and translation features planned for 2026'
      ],
      analysis: 'Microsoft continues its aggressive gaming strategy post-Activision. Discord\'s 200 million monthly users represent a massive community platform that complements Xbox\'s gaming ecosystem. The Teams integration suggests Microsoft sees Discord\'s UX as superior for real-time collaboration.',
      takeaways: [
        'Discord users should expect deeper Xbox and Microsoft 365 integrations',
        'Competitors like Slack may face increased pressure in gaming-adjacent markets',
        'Regulatory scrutiny expected given Microsoft\'s recent acquisition history'
      ]
    },
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
    summaryTabs: {
      keyPoints: [
        'Achieves 94% accuracy on PhD-level physics qualifying exams (vs 89% human average)',
        'New constitutional AI training reduces harmful outputs by 60%',
        'Context window expanded to 500K tokens with improved retrieval accuracy',
        'API pricing reduced by 40% compared to Claude 3.5 Sonnet'
      ],
      analysis: 'Anthropic\'s focus on safety-first development appears to be paying off. Claude 4 demonstrates that safety and capability can improve together, challenging the narrative that AI safety comes at the cost of performance. The expanded context window makes it particularly suitable for document analysis.',
      takeaways: [
        'Research and academic institutions may prefer Claude 4 for complex reasoning tasks',
        'The pricing reduction makes Claude more competitive for high-volume applications',
        'Constitutional AI approach may influence industry-wide safety standards'
      ]
    },
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
    summaryTabs: {
      keyPoints: [
        'Starship delivered 5 tons of scientific equipment to lunar south pole',
        'Landing accuracy within 50 meters of target—exceeding NASA requirements',
        'Mission cost estimated at $150 million, fraction of traditional lunar missions',
        'Return flight scheduled for 2026 to test in-situ resource utilization'
      ],
      analysis: 'This mission fundamentally changes the economics of lunar exploration. At roughly 1/10th the cost of Apollo-era missions, commercial lunar access becomes viable for scientific institutions and private enterprises. The precision landing demonstrates technology readiness for crewed Artemis missions.',
      takeaways: [
        'NASA\'s commercial partnership model validated for deep space missions',
        'Private lunar mining ventures may accelerate investment timelines',
        'International space agencies likely to seek similar commercial partnerships'
      ]
    },
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
    summaryTabs: {
      keyPoints: [
        'Companies must demonstrate AI safety before deployment, shifting burden of proof',
        'Fines up to 6% of global revenue for non-compliance (vs 4% under GDPR)',
        'Mandatory incident reporting within 72 hours of AI-related harms',
        'High-risk AI systems require third-party audits and certification'
      ],
      analysis: 'The EU continues to lead on tech regulation, creating a framework that could become the global standard. The shift to requiring companies to prove safety—rather than regulators proving harm—represents a fundamental change in how AI will be governed. This could slow deployment but may increase public trust.',
      takeaways: [
        'Companies deploying AI in EU must prepare for extensive documentation requirements',
        'Third-party AI auditing industry expected to grow significantly',
        'Non-EU companies may face difficult choices about EU market participation'
      ]
    },
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
    summaryTabs: {
      keyPoints: [
        'AlphaProof discovered novel proof for the Birch-Swinnerton-Dyer conjecture variant',
        'System combines reinforcement learning with formal theorem proving',
        'Proof verified by independent mathematicians and automated proof checkers',
        'Research published in Nature with full methodology open-sourced'
      ],
      analysis: 'This represents a qualitative shift in AI\'s role in mathematics—from computation to creativity. AlphaProof didn\'t just verify a proof; it discovered one that humans couldn\'t find. This suggests AI could accelerate mathematical research by exploring proof spaces beyond human intuition.',
      takeaways: [
        'Mathematicians may increasingly collaborate with AI systems for research',
        'Other long-standing conjectures could be tackled with similar approaches',
        'Formal verification methods gaining importance in AI-assisted research'
      ]
    },
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
