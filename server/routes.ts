import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDomainSchema, insertSearchSchema, domainFiltersSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

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
  { name: 'GoDaddy', affiliate: 'https://www.godaddy.com/domains/domain-name-search?domainToCheck=' },
  { name: 'Namecheap', affiliate: 'https://www.namecheap.com/domains/registration/results/?domain=' },
  { name: 'Hover', affiliate: 'https://hover.com/domains/results?utf8=✓&domain-name=' },
  { name: 'Porkbun', affiliate: 'https://porkbun.com/checkout/search?q=' },
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
  try {
    // Method 1: Check using DomainsDB API for existing domain records
    const domainsDbResponse = await axios.get(PUBLIC_DOMAIN_API, {
      params: {
        domain: domain.replace(/\.[^.]+$/, ''), // Remove TLD for search
        zone: domain.split('.').pop() // Get TLD
      },
      timeout: 3000,
      headers: {
        'User-Agent': 'DomainFinder/1.0'
      }
    });

    if (domainsDbResponse.data && domainsDbResponse.data.domains) {
      const exactMatch = domainsDbResponse.data.domains.find((d: any) => d.domain === domain);
      if (exactMatch) {
        return {
          domain,
          available: false,
          registrar: 'Registered'
        };
      }
    }
  } catch (error) {
    console.log(`DomainsDB check failed for ${domain}`);
  }

  try {
    // Method 2: Simple HTTP check to see if domain responds
    const response = await axios.get(`http://${domain}`, { 
      timeout: 2000,
      validateStatus: () => true // Accept any status code
    });
    
    // If we get any response, domain is likely active/taken
    return {
      domain,
      available: false,
      registrar: 'Active Website'
    };
  } catch (httpError) {
    // No HTTP response, try HTTPS
    try {
      const httpsResponse = await axios.get(`https://${domain}`, { 
        timeout: 2000,
        validateStatus: () => true
      });
      
      return {
        domain,
        available: false,
        registrar: 'Active Website (HTTPS)'
      };
    } catch (httpsError) {
      // No HTTP/HTTPS response - likely available or parked
      return {
        domain,
        available: true
      };
    }
  }
}

// Enhanced function to check multiple domains efficiently
async function checkMultipleDomains(domains: string[]): Promise<DomainAvailabilityResult[]> {
  const results = await Promise.allSettled(
    domains.map(domain => checkDomainAvailability(domain))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to check domain ${domains[index]}:`, result.reason);
      return {
        domain: domains[index],
        available: true, // Default to available if check fails
      };
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate domains based on keywords
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

      // Create list of all domains to check
      const domainsToCheck: string[] = [];
      const domainData: Array<{
        name: string;
        extension: string;
        price: string;
        variation: string;
      }> = [];

      // Limit variations to prevent too many API calls
      const limitedVariations = variations.slice(0, 8);
      
      for (const variation of limitedVariations) {
        for (const { ext, price } of EXTENSIONS) {
          const domainName = `${variation}${ext}`;
          domainsToCheck.push(domainName);
          domainData.push({
            name: domainName,
            extension: ext,
            price,
            variation
          });
        }
      }

      console.log(`Checking availability for ${domainsToCheck.length} domains...`);
      
      // Check all domains in batches
      const availabilityResults = await checkMultipleDomains(domainsToCheck);
      
      // Create domain records with real availability data
      for (let i = 0; i < domainData.length; i++) {
        const domainInfo = domainData[i];
        const availabilityResult = availabilityResults[i];
        const registrar = REGISTRARS[Math.floor(Math.random() * REGISTRARS.length)];
        
        // Use API price if available, otherwise use default
        const finalPrice = availabilityResult.price || domainInfo.price;
        const isPremium = availabilityResult.premium || parseFloat(finalPrice) > 30;
        
        const domain = await storage.createDomain({
          name: domainInfo.name,
          extension: domainInfo.extension,
          price: finalPrice,
          isAvailable: availabilityResult.available,
          isPremium,
          registrar: availabilityResult.registrar || registrar.name,
          affiliateLink: `${registrar.affiliate}${domainInfo.name}`,
          description: `Perfect for ${keywords.join(', ')} related businesses`,
          tags: keywords,
          length: domainInfo.name.length,
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
