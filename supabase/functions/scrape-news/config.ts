// Content ratio configuration and keyword definitions

export type ContentCategory = 'tech' | 'video_games' | 'finance' | 'politics' | 'climate';

export interface RatioConfig {
  category: ContentCategory;
  targetRatio: number;
  subCategories: string[];
}

export const DEFAULT_RATIOS: RatioConfig[] = [
  { category: 'tech', targetRatio: 0.58, subCategories: ['ai', 'apple', 'tesla', 'crypto', 'general'] },
  { category: 'video_games', targetRatio: 0.10, subCategories: ['gaming_tech', 'esports', 'hardware', 'vr_ar'] },
  { category: 'finance', targetRatio: 0.14, subCategories: ['markets', 'banking', 'investing', 'economy'] },
  { category: 'politics', targetRatio: 0.08, subCategories: ['government', 'elections', 'policy', 'international'] },
  { category: 'climate', targetRatio: 0.10, subCategories: ['environment', 'energy', 'sustainability'] },
];

// Keyword lists for content classification
export const CATEGORY_KEYWORDS: Record<ContentCategory, Record<string, string[]>> = {
  tech: {
    ai: [
      'artificial intelligence', 'machine learning', 'neural network', 'gpt', 'llm',
      'deep learning', 'ai model', 'chatgpt', 'openai', 'anthropic', 'claude',
      'gemini', 'large language model', 'generative ai', 'transformer', 'diffusion',
      'stable diffusion', 'midjourney', 'copilot', 'ai assistant', 'nlp',
      'natural language processing', 'computer vision', 'robotics', 'autonomous'
    ],
    apple: [
      'iphone', 'ipad', 'mac', 'macbook', 'ios', 'macos', 'apple watch', 'wwdc',
      'tim cook', 'apple silicon', 'm1', 'm2', 'm3', 'm4', 'airpods', 'vision pro',
      'app store', 'safari', 'xcode', 'swift', 'apple tv', 'homepod', 'siri',
      'apple intelligence', 'apple car', 'apple pay', 'icloud'
    ],
    tesla: [
      'tesla', 'elon musk', 'electric vehicle', 'ev', 'cybertruck', 'model s',
      'model 3', 'model x', 'model y', 'fsd', 'full self driving', 'autopilot',
      'supercharger', 'gigafactory', 'roadster', 'semi', 'powerwall', 'megapack',
      'battery', 'spacex', 'starlink', 'neuralink', 'boring company'
    ],
    general: [
      'software', 'startup', 'app', 'tech', 'digital', 'cloud', 'programming',
      'developer', 'api', 'saas', 'platform', 'silicon valley', 'venture capital',
      'ipo', 'acquisition', 'google', 'microsoft', 'amazon', 'meta', 'facebook',
      'instagram', 'tiktok', 'twitter', 'x corp', 'snapchat', 'linkedin',
      'youtube', 'netflix', 'streaming', 'cybersecurity', 'hacking', 'data breach', 
      '5g', '6g', 'semiconductor', 'chip', 'nvidia', 'amd', 'intel', 'qualcomm', 'tsmc'
    ]
  },
  video_games: {
    gaming_tech: [
      'gaming', 'video game', 'game engine', 'unreal engine', 'unity', 'graphics',
      'ray tracing', 'dlss', 'fsr', 'frame rate', 'fps', '4k gaming', '8k',
      'game streaming', 'cloud gaming', 'geforce now', 'xbox cloud', 'playstation',
      'xbox', 'nintendo', 'switch', 'steam deck', 'handheld gaming', 'pc gaming',
      'gaming pc', 'game developer', 'indie game', 'aaa game', 'game release'
    ],
    esports: [
      'esports', 'esport', 'competitive gaming', 'tournament', 'championship',
      'league of legends', 'valorant', 'counter-strike', 'cs2', 'dota', 'overwatch',
      'fortnite', 'apex legends', 'call of duty', 'twitch', 'streaming', 'streamer',
      'pro player', 'gaming team', 'prize pool', 'world championship'
    ],
    hardware: [
      'gaming gpu', 'graphics card', 'rtx', 'radeon', 'gaming laptop', 'gaming monitor',
      'refresh rate', '144hz', '240hz', 'gaming headset', 'gaming mouse', 'gaming keyboard',
      'mechanical keyboard', 'rgb', 'gaming chair', 'gaming setup', 'game controller',
      'dualsense', 'xbox controller', 'joystick', 'gaming peripheral'
    ],
    vr_ar: [
      'virtual reality', 'vr headset', 'quest', 'meta quest', 'psvr', 'htc vive',
      'valve index', 'augmented reality', 'mixed reality', 'xr', 'vr gaming',
      'immersive', 'metaverse', 'spatial computing', 'beat saber', 'half-life alyx',
      'vr experience', 'motion tracking', 'hand tracking', 'haptic feedback'
    ]
  },
  finance: {
    markets: [
      'stock', 'stocks', 'market', 'dow jones', 'nasdaq', 's&p 500', 'nyse',
      'trading', 'trader', 'bull market', 'bear market', 'rally', 'selloff',
      'earnings', 'quarterly', 'dividend', 'share price', 'market cap', 'ipo',
      'merger', 'acquisition', 'm&a', 'hedge fund', 'mutual fund', 'etf',
      'index fund', 'portfolio', 'asset', 'equity'
    ],
    banking: [
      'bank', 'banking', 'jpmorgan', 'goldman sachs', 'morgan stanley',
      'citigroup', 'wells fargo', 'bank of america', 'hsbc', 'credit suisse',
      'ubs', 'deutsche bank', 'loan', 'mortgage', 'deposit', 'lending',
      'savings', 'checking', 'credit', 'debit', 'fintech', 'neobank'
    ],
    investing: [
      'investment', 'investor', 'invest', 'return', 'roi', 'yield', 'bond',
      'treasury', 'securities', 'fund manager', 'wealth', 'asset management',
      'private equity', 'venture', 'angel investor', 'seed funding', 'series a',
      'valuation', 'unicorn', 'retirement', '401k', 'ira', 'pension'
    ],
    economy: [
      'economy', 'economic', 'gdp', 'inflation', 'deflation', 'recession',
      'federal reserve', 'fed', 'interest rate', 'monetary policy', 'fiscal',
      'treasury', 'debt ceiling', 'trade', 'tariff', 'export', 'import',
      'unemployment', 'jobs report', 'labor market', 'consumer', 'spending',
      'cpi', 'ppi', 'central bank', 'ecb', 'boe', 'imf', 'world bank'
    ],
    crypto: [
      'bitcoin', 'ethereum', 'crypto', 'cryptocurrency', 'blockchain', 'defi',
      'nft', 'web3', 'token', 'wallet', 'coinbase', 'binance', 'solana',
      'cardano', 'dogecoin', 'mining', 'staking', 'smart contract', 'dao',
      'decentralized', 'altcoin', 'stablecoin', 'usdc', 'tether', 'ledger'
    ]
  },
  politics: {
    government: [
      'government', 'congress', 'senate', 'house', 'white house', 'president',
      'biden', 'trump', 'administration', 'cabinet', 'supreme court', 'judiciary',
      'executive order', 'veto', 'legislation', 'law', 'regulation', 'agency',
      'fbi', 'cia', 'doj', 'department', 'secretary', 'attorney general'
    ],
    elections: [
      'election', 'vote', 'voting', 'ballot', 'poll', 'polling', 'campaign',
      'candidate', 'primary', 'caucus', 'delegate', 'electoral', 'swing state',
      'battleground', 'democrat', 'republican', 'gop', 'dnc', 'rnc',
      'midterm', 'runoff', 'recount', 'voter turnout'
    ],
    policy: [
      'policy', 'bill', 'act', 'reform', 'bipartisan', 'partisan', 'filibuster',
      'amendment', 'constitutional', 'healthcare', 'immigration', 'border',
      'gun control', 'abortion', 'tax', 'spending', 'budget', 'stimulus',
      'infrastructure', 'education', 'social security', 'medicare', 'medicaid'
    ],
    international: [
      'nato', 'un', 'united nations', 'eu', 'european union', 'g7', 'g20',
      'summit', 'treaty', 'alliance', 'sanction', 'diplomat', 'embassy',
      'foreign policy', 'state department', 'international', 'geopolitical',
      'china', 'russia', 'ukraine', 'israel', 'iran', 'north korea', 'taiwan'
    ]
  },
  climate: {
    environment: [
      'climate', 'climate change', 'global warming', 'greenhouse', 'carbon',
      'emissions', 'pollution', 'air quality', 'water quality', 'deforestation',
      'biodiversity', 'species', 'extinction', 'ecosystem', 'habitat',
      'conservation', 'wildlife', 'ocean', 'coral reef', 'plastic', 'waste',
      'recycling', 'epa', 'environmental'
    ],
    energy: [
      'renewable', 'solar', 'wind', 'hydro', 'geothermal', 'nuclear', 'clean energy',
      'green energy', 'fossil fuel', 'oil', 'gas', 'coal', 'petroleum',
      'energy grid', 'power plant', 'electricity', 'ev charging', 'hydrogen',
      'biofuel', 'carbon capture', 'net zero', 'decarbonization'
    ],
    sustainability: [
      'sustainability', 'sustainable', 'green', 'eco', 'organic', 'carbon neutral',
      'carbon footprint', 'esg', 'circular economy', 'zero waste', 'compost',
      'regenerative', 'ethical', 'fair trade', 'local', 'farm to table',
      'plant based', 'vegan', 'vegetarian', 'electric', 'hybrid'
    ]
  }
};

// Source priority mappings by category
export const CATEGORY_SOURCE_PRIORITY: Record<ContentCategory, string[]> = {
  tech: [
    'TechCrunch', 'The Verge', 'Wired', 'Ars Technica', 'MIT Technology Review',
    'Engadget', 'CNET', 'VentureBeat', 'Mashable', 'ZDNet', 'The Next Web',
    'AnandTech', 'Tom\'s Hardware', '9to5Mac', 'MacRumors', 'The Information'
  ],
  video_games: [
    'Ars Technica Gaming', 'The Verge Gaming', 'Polygon', 'IGN', 'Eurogamer',
    'Wired Gaming', 'Kotaku', 'GameSpot', 'PC Gamer', 'Rock Paper Shotgun',
    'VG247', 'GamesRadar', 'Destructoid', 'Nintendo Life', 'Push Square'
  ],
  finance: [
    'Bloomberg', 'Wall Street Journal', 'Financial Times', 'CNBC', 'Reuters',
    'MarketWatch', 'Barron\'s', 'Seeking Alpha', 'Yahoo Finance', 'Investor\'s Business Daily'
  ],
  politics: [
    'Politico', 'The Hill', 'BBC Politics', 'Reuters', 'Associated Press',
    'NPR', 'PBS NewsHour', 'C-SPAN', 'Roll Call', 'The Atlantic'
  ],
  climate: [
    'Inside Climate News', 'Yale E360', 'Guardian Environment', 'Carbon Brief',
    'Climate Desk', 'Grist', 'E&E News', 'DeSmog', 'The Revelator'
  ]
};

// Maximum articles per source per scrape
export const MAX_ARTICLES_PER_SOURCE = 10;

// Maximum content length for processing
export const MAX_CONTENT_LENGTH = 50000;

// Base quota per scrape cycle
export const BASE_ARTICLES_PER_SCRAPE = 50;
