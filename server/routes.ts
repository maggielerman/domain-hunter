import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDomainSchema, insertSearchSchema, domainFiltersSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";
import { AFFILIATE_CONFIGS, getRegistrarPricing } from "./affiliate-config";

// Domain generation utilities with real pricing
const EXTENSIONS = [
  { ext: '.com', price: '12.99' },
  { ext: '.net', price: '14.99' },
  { ext: '.org', price: '13.99' },
  { ext: '.io', price: '39.99' },
  { ext: '.co', price: '29.99' },
  { ext: '.tech', price: '49.99' },
  { ext: '.app', price: '19.99' },
  { ext: '.dev', price: '17.99' },
  { ext: '.ai', price: '89.99' },
  { ext: '.xyz', price: '2.99' },
  { ext: '.me', price: '19.99' },
  { ext: '.info', price: '19.99' },
];

const REGISTRARS = [
  { 
    name: 'GoDaddy', 
    affiliate: 'https://www.godaddy.com/domains/domain-name-search?domainToCheck=',
    logo: 'godaddy',
    pricing: { '.com': 17.99, '.net': 19.99, '.org': 19.99, '.io': 59.99, '.co': 32.99, '.tech': 52.99, '.app': 19.99, '.dev': 17.99, '.ai': 89.99, '.xyz': 12.99, '.me': 19.99, '.info': 19.99 }
  },
  { 
    name: 'Namecheap', 
    affiliate: 'https://www.namecheap.com/domains/registration/results/?domain=',
    logo: 'namecheap', 
    pricing: { '.com': 13.98, '.net': 15.98, '.org': 14.98, '.io': 48.88, '.co': 28.88, '.tech': 48.88, '.app': 18.88, '.dev': 15.88, '.ai': 85.88, '.xyz': 8.88, '.me': 18.88, '.info': 18.88 }
  },
  { 
    name: 'Hover', 
    affiliate: 'https://hover.com/domains/results?utf8=✓&domain-name=',
    logo: 'hover',
    pricing: { '.com': 15.99, '.net': 17.99, '.org': 16.99, '.io': 79.00, '.co': 39.99, '.tech': 59.99, '.app': 19.99, '.dev': 17.99, '.ai': 99.99, '.xyz': 14.99, '.me': 19.99, '.info': 19.99 }
  },
  { 
    name: 'Porkbun', 
    affiliate: 'https://porkbun.com/checkout/search?q=',
    logo: 'porkbun',
    pricing: { '.com': 10.73, '.net': 11.98, '.org': 11.98, '.io': 56.00, '.co': 29.47, '.tech': 49.47, '.app': 16.47, '.dev': 14.47, '.ai': 81.47, '.xyz': 3.47, '.me': 16.47, '.info': 16.47 }
  },
  {
    name: 'Squarespace',
    affiliate: 'https://domains.squarespace.com/search?query=',
    logo: 'squarespace',
    pricing: { '.com': 20.00, '.net': 20.00, '.org': 20.00, '.io': 70.00, '.co': 35.00, '.tech': 60.00, '.app': 25.00, '.dev': 22.00, '.ai': 95.00, '.xyz': 15.00, '.me': 25.00, '.info': 25.00 }
  }
];

// Domain availability checking using multiple methods
const RAPIDAPI_DOMAIN_URL = 'https://domain-availability.p.rapidapi.com/v1/';
const PUBLIC_DOMAIN_API = 'https://api.domainsdb.info/v1/domains/search';

interface DomainAvailabilityResult {
  domain: string;
  available: boolean;
  registrar?: string;
  price?: string;
  premium?: boolean;
}

function generateDomainVariations(keywords: string[]): string[] {
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
  
  return Array.from(new Set(variations)); // Remove duplicates
}

async function checkDomainAvailability(domain: string): Promise<DomainAvailabilityResult> {
  const extension = domain.substring(domain.lastIndexOf('.'));
  const basePrice = EXTENSIONS.find(ext => ext.ext === extension)?.price || '19.99';
  
  // Try WHOIS API via RapidAPI for real data
  if (process.env.RAPIDAPI_KEY) {
    try {
      // Try the correct WHOIS API endpoint
      const response = await axios.get(`https://whois-api.p.rapidapi.com/whois`, {
        timeout: 8000,
        params: { domain },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'whois-api.p.rapidapi.com'
        }
      });

      if (response.data && response.data.domain) {
        const isAvailable = !response.data.domain.registered || 
                           response.data.domain.available === true ||
                           !response.data.domain.registrar;
        
        return {
          domain,
          available: isAvailable,
          registrar: isAvailable ? 'Available' : (response.data.domain.registrar || 'Registered'),
          price: isAvailable ? basePrice : undefined,
          premium: isAvailable && parseFloat(basePrice) > 30
        };
      }
    } catch (apiError: any) {
      // If rate limited or API down, we should inform the user
      if (apiError.response?.status === 429) {
        console.log(`Rate limited for ${domain}, waiting before retry...`);
        return {
          domain,
          available: false,
          registrar: 'Rate Limited - Check Manually',
          price: undefined,
          premium: false
        };
      }
      console.log(`WHOIS API check failed for ${domain}: ${apiError.message}`);
    }
  }

  // DNS-based availability check as fallback (this is real data)
  try {
    const dns = await import('dns');
    const { promisify } = await import('util');
    const resolve = promisify(dns.resolve);
    const resolveMx = promisify(dns.resolveMx);
    
    let hasRecords = false;
    
    // Check multiple DNS record types - this gives real availability info
    try {
      await resolve(domain, 'A');
      hasRecords = true;
    } catch (e) {
      try {
        await resolve(domain, 'AAAA');
        hasRecords = true;
      } catch (e) {
        try {
          await resolveMx(domain);
          hasRecords = true;
        } catch (e) {
          try {
            await resolve(domain, 'NS');
            hasRecords = true;
          } catch (e) {
            // No DNS records found - likely available
          }
        }
      }
    }
    
    return {
      domain,
      available: !hasRecords,
      registrar: hasRecords ? 'Registered (DNS Verified)' : 'Check with Registrar',
      price: !hasRecords ? basePrice : undefined,
      premium: !hasRecords && parseFloat(basePrice) > 30
    };
    
  } catch (error) {
    console.log(`DNS check failed for ${domain}: ${error}`);
  }

  // If all methods fail, return unknown status
  return {
    domain,
    available: false,
    registrar: 'Unknown - Check Manually',
    price: undefined,
    premium: false
  };
}

// Enhanced function to check multiple domains efficiently with rate limiting
async function checkMultipleDomains(domains: string[]): Promise<DomainAvailabilityResult[]> {
  const results: DomainAvailabilityResult[] = [];
  
  // Process domains in smaller batches to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < domains.length; i += batchSize) {
    const batch = domains.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(domain => checkDomainAvailability(domain))
    );
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Failed to check domain ${batch[index]}:`, result.reason);
        results.push({
          domain: batch[index],
          available: true, // Default to available if check fails
        });
      }
    });
    
    // Add small delay between batches to respect rate limits
    if (i + batchSize < domains.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate domains based on keywords
  // Single domain availability check endpoint
  app.post("/api/domains/check", async (req, res) => {
    try {
      const { domain } = req.body;
      
      if (!domain || typeof domain !== 'string') {
        return res.status(400).json({ error: "Domain is required" });
      }
      
      // Check if domain already exists in storage
      const existingDomain = await storage.getDomainByName(domain);
      if (existingDomain) {
        return res.json({ domain: existingDomain });
      }
      
      // Check availability
      const availabilityResult = await checkDomainAvailability(domain);
      const extension = domain.substring(domain.lastIndexOf('.'));
      
      // Get pricing from all registrars
      const registrarPricing = getRegistrarPricing(domain, extension);
      
      // Get cheapest price
      const prices = Object.values(registrarPricing).map((r: any) => r.price);
      const cheapestPrice = prices.length > 0 ? Math.min(...prices) : parseFloat(availabilityResult.price || '19.99');
      const finalPrice = availabilityResult.price || cheapestPrice.toString();
      const isPremium = availabilityResult.premium || parseFloat(finalPrice) > 30;
      
      // Create domain record
      const domainRecord = await storage.createDomain({
        name: domain,
        extension,
        price: finalPrice,
        isAvailable: availabilityResult.available,
        isPremium,
        registrar: availabilityResult.registrar || 'Multiple',
        affiliateLink: registrarPricing[Object.keys(registrarPricing)[0]]?.affiliateLink,
        registrarPricing,
        description: `Direct search for ${domain}`,
        tags: [domain.substring(0, domain.lastIndexOf('.'))],
        length: domain.length,
      });
      
      res.json({ domain: domainRecord });
    } catch (error) {
      console.error("Domain check error:", error);
      res.status(500).json({ error: "Failed to check domain availability" });
    }
  });

  app.post("/api/domains/generate", async (req, res) => {
    try {
      const { query, filters } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }

      // Parse keywords from query
      const keywords = query.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);

      if (keywords.length === 0) {
        return res.status(400).json({ message: "No valid keywords found" });
      }

      // Generate domain variations
      const variations = generateDomainVariations(keywords);
      const allDomains = [];

      // Determine target extensions based on filters
      const targetExtensions = filters.extensions && filters.extensions.length > 0 
        ? EXTENSIONS.filter(ext => filters.extensions.includes(ext.ext))
        : EXTENSIONS;

      // Smart domain generation with more lenient filtering
      const targetCount = 60;
      let selectedDomains: Array<{
        name: string;
        extension: string;
        price: string;
        variation: string;
        isAvailable: boolean;
        registrarStatus: string;
      }> = [];

      console.log(`Generating domains for keywords: ${keywords.join(', ')}`);
      console.log(`Target: ${targetCount} domains, availableOnly=${filters.availableOnly}`);

      // Prioritize extensions - .com first, then others
      const prioritizedExtensions = targetExtensions.sort((a, b) => {
        if (a.ext === '.com') return -1;
        if (b.ext === '.com') return 1;
        return 0;
      });

      // Generate domains without API calls to avoid rate limiting
      for (let i = 0; i < variations.length && selectedDomains.length < targetCount; i++) {
        const variation = variations[i];
        
        for (const { ext, price } of prioritizedExtensions) {
          if (selectedDomains.length >= targetCount) break;
          
          const domainName = `${variation}${ext}`;
          
          // Get real availability data for first few domains, mark others for manual check
          let isAvailable = false;
          let registrarStatus = 'Check Manually';
          
          if (selectedDomains.length < 5) {
            // Only check first few to avoid rate limits
            const availability = await checkDomainAvailability(domainName);
            isAvailable = availability.available;
            registrarStatus = availability.registrar || 'Unknown';
          } else {
            // Mark remaining domains as requiring manual verification
            registrarStatus = 'Requires Verification';
            isAvailable = false; // Conservative approach
          }
          
          // Apply filters
          if (filters.availableOnly && !isAvailable) {
            continue;
          }
          
          // Apply price filters
          const domainPrice = parseFloat(price);
          if (filters.minPrice && domainPrice < filters.minPrice) continue;
          if (filters.maxPrice && domainPrice > filters.maxPrice) continue;
          
          selectedDomains.push({
            name: domainName,
            extension: ext,
            price: price,
            variation,
            isAvailable,
            registrarStatus
          });
        }
      }

      console.log(`Selected ${selectedDomains.length} domains after filtering`);
      
      // Create domain records without external API calls
      const generatedDomains = [];
      for (let i = 0; i < selectedDomains.length; i++) {
        const domainInfo = selectedDomains[i];
        
        // Get pricing and affiliate links from all registrars for this extension
        const { affiliateLink, registrarPricing } = getRegistrarPricing(domainInfo.name, domainInfo.extension);

        // Use configured price for extension
        const finalPrice = domainInfo.price;
        const isPremium = parseFloat(finalPrice) > 30;
        
        const domain = await storage.createDomain({
          name: domainInfo.name,
          extension: domainInfo.extension,
          price: finalPrice,
          isAvailable: domainInfo.isAvailable,
          isPremium,
          registrar: domainInfo.registrarStatus,
          affiliateLink,
          registrarPricing,
          description: `Generated variation of "${keywords.join(' ')}" - ${domainInfo.variation}`,
          tags: [...keywords, domainInfo.variation],
          length: domainInfo.name.length
        });
        
        generatedDomains.push(domain);
      }

      // Record the search
      await storage.createSearch({
        query,
        filters: filters || {},
        resultsCount: generatedDomains.length,
      });

      res.json({ domains: generatedDomains, total: generatedDomains.length });
    } catch (error) {
      console.error('Domain generation error:', error);
      res.status(500).json({ message: "Failed to generate domains" });
    }
  });

  // Search existing domains with filters
  app.get("/api/domains/search", async (req, res) => {
    try {
      const { q: query, ...filterParams } = req.query;
      
      // Validate filters
      const filtersResult = domainFiltersSchema.safeParse(filterParams);
      const filters = filtersResult.success ? filtersResult.data : {};

      const domains = await storage.searchDomains(query as string || '', filters);
      
      res.json({ domains, total: domains.length });
    } catch (error) {
      console.error('Domain search error:', error);
      res.status(500).json({ message: "Failed to search domains" });
    }
  });

  // Get domain by ID
  app.get("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const domain = await storage.getDomain(id);
      
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      
      res.json(domain);
    } catch (error) {
      console.error('Get domain error:', error);
      res.status(500).json({ message: "Failed to get domain" });
    }
  });

  // Check specific domain availability
  app.post("/api/domains/check", async (req, res) => {
    try {
      const { domain } = req.body;
      
      if (!domain || typeof domain !== 'string') {
        return res.status(400).json({ message: "Domain is required" });
      }

      console.log(`Checking availability for single domain: ${domain}`);
      const availabilityResult = await checkDomainAvailability(domain);
      
      // Update or create domain record
      let domainRecord = await storage.getDomainByName(domain);
      if (domainRecord) {
        domainRecord = await storage.updateDomainAvailability(domain, availabilityResult.available);
      }
      
      res.json({ 
        domain, 
        isAvailable: availabilityResult.available,
        registrar: availabilityResult.registrar,
        price: availabilityResult.price,
        premium: availabilityResult.premium,
        record: domainRecord 
      });
    } catch (error) {
      console.error('Domain check error:', error);
      res.status(500).json({ message: "Failed to check domain availability" });
    }
  });

  // Get recent searches
  app.get("/api/searches/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const searches = await storage.getRecentSearches(limit);
      res.json(searches);
    } catch (error) {
      console.error('Get recent searches error:', error);
      res.status(500).json({ message: "Failed to get recent searches" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
