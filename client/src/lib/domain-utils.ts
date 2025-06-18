export const POPULAR_EXTENSIONS = [
  '.com', '.net', '.org', '.io', '.co', '.tech', '.app', '.dev'
];

export const EXTENSION_PRICES: Record<string, number> = {
  '.com': 12.99,
  '.net': 14.99,
  '.org': 13.99,
  '.io': 39.99,
  '.co': 29.99,
  '.tech': 49.99,
  '.app': 19.99,
  '.dev': 17.99,
};

export const REGISTRARS = [
  'GoDaddy',
  'Namecheap', 
  'Google Domains',
  'Hover'
];

export function generateDomainVariations(keywords: string[]): string[] {
  const variations: string[] = [];
  const prefixes = ['get', 'my', 'the', 'best', 'top', 'pro', 'smart', 'quick', 'fast', 'easy'];
  const suffixes = ['hub', 'lab', 'pro', 'zone', 'spot', 'base', 'link', 'space', 'world', 'place'];
  
  // Single keywords
  keywords.forEach(keyword => {
    variations.push(keyword);
    
    // With prefixes
    prefixes.forEach(prefix => variations.push(`${prefix}${keyword}`));
    
    // With suffixes  
    suffixes.forEach(suffix => variations.push(`${keyword}${suffix}`));
  });
  
  // Combine keywords
  for (let i = 0; i < keywords.length; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      variations.push(`${keywords[i]}${keywords[j]}`);
      variations.push(`${keywords[j]}${keywords[i]}`);
    }
  }
  
  return [...new Set(variations)]; // Remove duplicates
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numPrice);
}

export function getDomainLength(domain: string): number {
  return domain.length;
}

export function extractKeywords(query: string): string[] {
  return query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
}
