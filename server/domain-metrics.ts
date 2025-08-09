// Domain metrics and analysis utilities
export interface DomainMetrics {
  length: number;
  age: string;
  backlinks: string;
  seoScore: number;
  brandability: number;
  memorability: number;
  isTypable: boolean;
  hasHyphens: boolean;
  hasNumbers: boolean;
  category: string;
}

export function calculateDomainMetrics(domainName: string): DomainMetrics {
  const nameOnly = domainName.substring(0, domainName.lastIndexOf('.'));
  
  return {
    length: nameOnly.length,
    age: 'New domain', // Would integrate with domain age API if available
    backlinks: 'No backlinks', // Would integrate with SEO API if available  
    seoScore: calculateSEOScore(nameOnly),
    brandability: calculateBrandability(nameOnly),
    memorability: calculateMemorability(nameOnly),
    isTypable: !nameOnly.includes('-') && !nameOnly.match(/\d/),
    hasHyphens: nameOnly.includes('-'),
    hasNumbers: /\d/.test(nameOnly),
    category: categorizeKeywords(nameOnly)
  };
}

function calculateSEOScore(name: string): number {
  let score = 50; // Base score
  
  // Length optimization (8-15 chars is ideal)
  if (name.length >= 8 && name.length <= 15) score += 20;
  else if (name.length < 8) score += 10;
  else if (name.length > 20) score -= 20;
  
  // No hyphens or numbers is better for SEO
  if (!name.includes('-')) score += 10;
  if (!/\d/.test(name)) score += 10;
  
  // Common words boost SEO
  const commonWords = ['app', 'web', 'tech', 'hub', 'pro', 'plus', 'best', 'top'];
  if (commonWords.some(word => name.toLowerCase().includes(word))) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

function calculateBrandability(name: string): number {
  let score = 50;
  
  // Shorter names are more brandable
  if (name.length <= 8) score += 25;
  else if (name.length <= 12) score += 15;
  else score -= 10;
  
  // Easy to pronounce patterns
  const vowelCount = (name.match(/[aeiou]/gi) || []).length;
  const consonantCount = name.length - vowelCount;
  const vowelRatio = vowelCount / name.length;
  
  // Ideal vowel ratio is around 0.3-0.5
  if (vowelRatio >= 0.3 && vowelRatio <= 0.5) score += 15;
  
  // No numbers or hyphens for brandability
  if (!/\d/.test(name)) score += 10;
  if (!name.includes('-')) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

function calculateMemorability(name: string): number {
  let score = 50;
  
  // Short names are more memorable
  if (name.length <= 6) score += 30;
  else if (name.length <= 10) score += 20;
  else if (name.length <= 15) score += 10;
  
  // Repeating patterns or alliteration
  const hasRepeatingChars = /(.)\1/.test(name);
  const words = name.split(/(?=[A-Z])|[-_]/);
  const hasAlliteration = words.length > 1 && words[0][0] === words[1][0];
  
  if (hasRepeatingChars || hasAlliteration) score += 15;
  
  // Real words are more memorable
  const commonWords = [
    'app', 'web', 'tech', 'hub', 'pro', 'plus', 'best', 'top', 'smart', 'quick',
    'easy', 'fast', 'cool', 'new', 'good', 'great', 'super', 'ultra', 'mega'
  ];
  
  if (commonWords.some(word => name.toLowerCase().includes(word))) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

function categorizeKeywords(name: string): string {
  const categories = {
    'tech': ['tech', 'app', 'web', 'digital', 'online', 'cyber', 'net', 'soft', 'code', 'dev'],
    'business': ['biz', 'pro', 'corp', 'company', 'enterprise', 'solutions', 'services', 'group'],
    'lifestyle': ['life', 'style', 'living', 'home', 'family', 'personal', 'daily', 'wellness'],
    'creative': ['art', 'design', 'creative', 'studio', 'media', 'photo', 'video', 'music'],
    'health': ['health', 'fit', 'wellness', 'medical', 'care', 'therapy', 'nutrition'],
    'education': ['learn', 'edu', 'school', 'training', 'course', 'academy', 'knowledge'],
    'finance': ['finance', 'money', 'invest', 'bank', 'pay', 'budget', 'wealth', 'fund'],
    'travel': ['travel', 'trip', 'vacation', 'journey', 'explore', 'adventure', 'tour'],
    'food': ['food', 'recipe', 'cook', 'kitchen', 'restaurant', 'cafe', 'meal', 'taste'],
    'shopping': ['shop', 'store', 'market', 'buy', 'sell', 'deal', 'discount', 'sale']
  };
  
  const nameLower = name.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}