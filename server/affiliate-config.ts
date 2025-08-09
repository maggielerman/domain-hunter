// Affiliate configuration for domain registrars
// Each registrar requires specific tracking parameters

export interface AffiliateConfig {
  name: string;
  baseUrl: string;
  affiliateId?: string;
  trackingParam: string;
  additionalParams?: Record<string, string>;
  pricing: Record<string, number>;
  logo: string;
}

export const AFFILIATE_CONFIGS: AffiliateConfig[] = [
  {
    name: 'GoDaddy',
    baseUrl: 'https://www.godaddy.com/domains/domain-name-search',
    trackingParam: 'isc', // GoDaddy uses 'isc' parameter for affiliate tracking
    affiliateId: process.env.GODADDY_AFFILIATE_ID, // e.g. 'your-affiliate-id'
    additionalParams: {
      'plid': process.env.GODADDY_PLID || '', // Product Line ID
    },
    pricing: { 
      '.com': 17.99, '.net': 19.99, '.org': 19.99, '.io': 59.99, 
      '.co': 32.99, '.tech': 52.99, '.app': 19.99, '.dev': 17.99, 
      '.ai': 89.99, '.xyz': 12.99, '.me': 19.99, '.info': 19.99 
    },
    logo: 'godaddy'
  },
  {
    name: 'Namecheap',
    baseUrl: 'https://www.namecheap.com/domains/registration/results',
    trackingParam: 'aff', // Namecheap affiliate parameter
    affiliateId: process.env.NAMECHEAP_AFFILIATE_ID, // Your Namecheap affiliate ID
    pricing: { 
      '.com': 13.98, '.net': 15.98, '.org': 14.98, '.io': 48.88, 
      '.co': 28.88, '.tech': 48.88, '.app': 18.88, '.dev': 15.88, 
      '.ai': 85.88, '.xyz': 8.88, '.me': 18.88, '.info': 18.88 
    },
    logo: 'namecheap'
  },
  {
    name: 'Hover',
    baseUrl: 'https://hover.com/domains/results',
    trackingParam: 'utm_source', // Hover uses UTM tracking
    affiliateId: process.env.HOVER_AFFILIATE_ID, // Your Hover affiliate code
    additionalParams: {
      'utm_medium': 'affiliate',
      'utm_campaign': 'domain-finder'
    },
    pricing: { 
      '.com': 15.99, '.net': 17.99, '.org': 16.99, '.io': 79.00, 
      '.co': 39.99, '.tech': 59.99, '.app': 19.99, '.dev': 17.99, 
      '.ai': 99.99, '.xyz': 14.99, '.me': 19.99, '.info': 19.99 
    },
    logo: 'hover'
  },
  {
    name: 'Porkbun',
    baseUrl: 'https://porkbun.com/checkout/search',
    trackingParam: 'ref', // Porkbun referral parameter
    affiliateId: process.env.PORKBUN_AFFILIATE_ID, // Your Porkbun affiliate code
    pricing: { 
      '.com': 10.73, '.net': 11.98, '.org': 11.98, '.io': 56.00, 
      '.co': 29.47, '.tech': 49.47, '.app': 16.47, '.dev': 14.47, 
      '.ai': 81.47, '.xyz': 3.47, '.me': 16.47, '.info': 16.47 
    },
    logo: 'porkbun'
  },
  {
    name: 'Squarespace',
    baseUrl: 'https://domains.squarespace.com/search',
    trackingParam: 'ref', // Squarespace referral tracking
    affiliateId: process.env.SQUARESPACE_AFFILIATE_ID, // Your Squarespace affiliate ID
    pricing: { 
      '.com': 20.00, '.net': 20.00, '.org': 20.00, '.io': 70.00, 
      '.co': 35.00, '.tech': 60.00, '.app': 25.00, '.dev': 22.00, 
      '.ai': 95.00, '.xyz': 15.00, '.me': 25.00, '.info': 25.00 
    },
    logo: 'squarespace'
  }
];

export function generateAffiliateLink(config: AffiliateConfig, domain: string): string {
  // Construct proper affiliate URLs for each registrar
  let url: URL;
  
  if (config.name === 'GoDaddy') {
    // GoDaddy: Direct domain search with affiliate tracking
    url = new URL('https://www.godaddy.com/domainsearch/find');
    url.searchParams.set('checkAvail', '1');
    url.searchParams.set('domainToCheck', domain);
    if (config.affiliateId) {
      url.searchParams.set('isc', config.affiliateId);
      if (config.additionalParams?.plid) {
        url.searchParams.set('plid', config.additionalParams.plid);
      }
    }
  } else if (config.name === 'Namecheap') {
    // Namecheap: Domain registration results page
    url = new URL('https://www.namecheap.com/domains/registration/results/');
    url.searchParams.set('domain', domain);
    if (config.affiliateId) {
      url.searchParams.set('afftrack', config.affiliateId);
    }
  } else if (config.name === 'Hover') {
    // Hover: Domain search results
    url = new URL('https://hover.com/domains/results');
    url.searchParams.set('utf8', '✓');
    url.searchParams.set('domain-name', domain);
    if (config.affiliateId) {
      url.searchParams.set('utm_source', config.affiliateId);
      url.searchParams.set('utm_medium', 'affiliate');
      url.searchParams.set('utm_campaign', 'domain-search');
    }
  } else if (config.name === 'Porkbun') {
    // Porkbun: Direct to domain checkout
    url = new URL('https://porkbun.com/checkout/search');
    url.searchParams.set('q', domain);
    if (config.affiliateId) {
      url.searchParams.set('coupon', config.affiliateId);
    }
  } else if (config.name === 'Squarespace') {
    // Squarespace: Domain search
    url = new URL('https://domains.squarespace.com/search');
    url.searchParams.set('query', domain);
    if (config.affiliateId) {
      url.searchParams.set('channel', config.affiliateId);
    }
  } else {
    // Fallback to base URL with domain parameter
    url = new URL(config.baseUrl);
    url.searchParams.set('domain', domain);
    if (config.affiliateId) {
      url.searchParams.set(config.trackingParam, config.affiliateId);
    }
  }
  
  return url.toString();
}

export function getRegistrarPricing(domain: string, extension: string) {
  const registrarPricing: Record<string, any> = {};
  
  AFFILIATE_CONFIGS.forEach(config => {
    const extensionPrice = config.pricing[extension];
    if (extensionPrice) {
      registrarPricing[config.name] = {
        price: extensionPrice,
        affiliateLink: generateAffiliateLink(config, domain),
        logo: config.logo,
        hasAffiliate: !!config.affiliateId
      };
    }
  });
  
  return {
    registrarPricing,
    affiliateLink: registrarPricing[Object.keys(registrarPricing)[0]]?.affiliateLink || generateAffiliateLink(AFFILIATE_CONFIGS[0], domain)
  };
}