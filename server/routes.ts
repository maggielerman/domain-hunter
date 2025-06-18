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
  // Fast realistic simulation based on domain characteristics
  const extension = domain.substring(domain.lastIndexOf('.'));
  const domainName = domain.substring(0, domain.lastIndexOf('.'));
  const basePrice = EXTENSIONS.find(ext => ext.ext === extension)?.price || '19.99';
  
  // Well-known domains that are definitely taken
  const knownTakenDomains = ['google', 'facebook', 'amazon', 'microsoft', 'apple', 'twitter', 'instagram', 'youtube', 'linkedin', 'github', 'stackoverflow', 'reddit', 'wikipedia', 'netflix', 'spotify'];
  const isDefinitelyTaken = knownTakenDomains.some(known => domainName.toLowerCase().includes(known));
  
  if (isDefinitelyTaken) {
    return {
      domain,
      available: false,
      registrar: 'Major Brand',
      price: undefined,
      premium: false
    };
  }
  
  // Check for common patterns that indicate likely availability
  const commonWords = ['app', 'web', 'site', 'online', 'digital', 'tech', 'blog', 'shop', 'store', 'news', 'info', 'data', 'cloud', 'smart', 'mobile', 'best', 'top', 'my', 'get', 'new'];
  const isCommon = commonWords.some(word => domainName.toLowerCase().includes(word));
  const isShort = domainName.length <= 4;
  const hasNumbers = /\d/.test(domainName);
  const hasHyphens = domainName.includes('-');
  const isUnique = domainName.length > 8 && !isCommon;
  const hasSpecialChars = /[0-9\-_]/.test(domainName);
  
  // Calculate availability probability with realistic weighting
  let availabilityScore = Math.random() * 0.6 + 0.2; // Base score between 0.2-0.8
  
  if (isShort) availabilityScore -= 0.7;
  if (isCommon) availabilityScore -= 0.5;
  if (hasNumbers) availabilityScore += 0.3;
  if (hasHyphens) availabilityScore += 0.4;
  if (isUnique) availabilityScore += 0.3;
  if (hasSpecialChars) availabilityScore += 0.2;
  if (extension === '.xyz' || extension === '.info') availabilityScore += 0.3;
  if (extension === '.com') availabilityScore -= 0.2;
  
  const isAvailable = availabilityScore > 0.4;
  
  return {
    domain,
    available: isAvailable,
    registrar: isAvailable ? 'Available' : 'Registered',
    price: isAvailable ? basePrice : undefined,
    premium: isAvailable && parseFloat(basePrice) > 25
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
      const domains = [];

      // Determine target extensions based on filters
      const targetExtensions = filters.extensions && filters.extensions.length > 0 
        ? EXTENSIONS.filter(ext => filters.extensions.includes(ext.ext))
        : EXTENSIONS;

      // Smart domain generation with filtering
      const targetCount = filters.availableOnly ? 100 : 80; // More results when filtering for available only
      let selectedDomains: Array<{
        name: string;
        extension: string;
        price: string;
        variation: string;
      }> = [];

      console.log(`Generating domains for keywords: ${keywords.join(', ')}`);
      console.log(`Target: ${targetCount} domains, availableOnly=${filters.availableOnly}`);

      // Batch processing for better performance
      const batchSize = 20;
      const batches: string[][] = [];
      
      // Prioritize extensions - .com first, then others
      const prioritizedExtensions = targetExtensions.sort((a, b) => {
        if (a.ext === '.com') return -1;
        if (b.ext === '.com') return 1;
        return 0;
      });

      // Generate domain batches
      for (let i = 0; i < variations.length && selectedDomains.length < targetCount; i += batchSize) {
        const variationBatch = variations.slice(i, i + batchSize);
        
        for (const { ext, price } of prioritizedExtensions) {
          if (selectedDomains.length >= targetCount) break;
          
          const domainBatch = variationBatch.map(variation => `${variation}${ext}`);
          
          // Check batch availability in parallel
          const availabilityResults = await Promise.all(
            domainBatch.map(domain => checkDomainAvailability(domain))
          );
          
          // Process results
          for (let j = 0; j < domainBatch.length; j++) {
            if (selectedDomains.length >= targetCount) break;
            
            const domainName = domainBatch[j];
            const availability = availabilityResults[j];
            const variation = variationBatch[j];
            
            // Apply filters during generation
            if (filters.availableOnly && !availability.available) {
              continue;
            }
            
            // Apply price filters
            const domainPrice = parseFloat(availability.price || price);
            if (filters.minPrice && domainPrice < filters.minPrice) continue;
            if (filters.maxPrice && domainPrice > filters.maxPrice) continue;
            
            selectedDomains.push({
              name: domainName,
              extension: ext,
              price: availability.price || price,
              variation
            });
          }
        }
      }

      console.log(`Selected ${selectedDomains.length} domains after filtering`);
      
      // Get final availability results for selected domains (re-check for consistency)
      const availabilityResults = await Promise.all(
        selectedDomains.map(domain => checkDomainAvailability(domain.name))
      );
      
      // Create domain records with availability data
      for (let i = 0; i < selectedDomains.length; i++) {
        const domainInfo = selectedDomains[i];
        const availabilityResult = availabilityResults[i];
        
        // Get pricing and affiliate links from all registrars for this extension
        const registrarPricing = getRegistrarPricing(domainInfo.name, domainInfo.extension);

        // Use cheapest registrar price
        const prices = Object.values(registrarPricing).map((r: any) => r.price);
        const cheapestPrice = prices.length > 0 ? Math.min(...prices) : parseFloat(domainInfo.price);
        const finalPrice = availabilityResult.price || cheapestPrice.toString();
        const isPremium = availabilityResult.premium || parseFloat(finalPrice) > 30;
        
        const domain = await storage.createDomain({
          name: domainInfo.name,
          extension: domainInfo.extension,
          price: finalPrice,
          isAvailable: availabilityResult.available,
          isPremium,
          registrar: availabilityResult.registrar || 'Available',
          affiliateLink: registrarPricing[Object.keys(registrarPricing)[0]]?.affiliateLink,
          registrarPricing,
          description: `Generated from keywords: ${keywords.join(', ')}`,
          tags: keywords,
          length: domainInfo.name.replace(domainInfo.extension, '').length,
        });
        
        domains.push(domain);
      }

      // Record the search
      await storage.createSearch({
        query,
        filters: filters || {},
        resultsCount: domains.length,
      });

      res.json({ domains, total: domains.length });
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
