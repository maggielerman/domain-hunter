import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDomainSchema, insertSearchSchema, domainFiltersSchema } from "@shared/schema";
import { z } from "zod";

// Domain generation utilities
const EXTENSIONS = [
  { ext: '.com', price: '12.99' },
  { ext: '.net', price: '14.99' },
  { ext: '.org', price: '13.99' },
  { ext: '.io', price: '39.99' },
  { ext: '.co', price: '29.99' },
  { ext: '.tech', price: '49.99' },
  { ext: '.app', price: '19.99' },
  { ext: '.dev', price: '17.99' },
];

const REGISTRARS = [
  { name: 'GoDaddy', affiliate: 'https://www.godaddy.com/domains/domain-name-search?isc=gennameXXX' },
  { name: 'Namecheap', affiliate: 'https://www.namecheap.com/domains/registration/results/?domain=' },
  { name: 'Google Domains', affiliate: 'https://domains.google.com/registrar/search?searchTerm=' },
  { name: 'Hover', affiliate: 'https://hover.com/domains/results?utf8=✓&domain-name=' },
];

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
  
  return [...new Set(variations)]; // Remove duplicates
}

async function checkDomainAvailability(domain: string): Promise<boolean> {
  // This would integrate with real domain availability APIs
  // For now, simulate some domains as taken
  const takenDomains = ['techstartup.com', 'startup.com', 'tech.com', 'innovation.com'];
  return !takenDomains.includes(domain);
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

      // Create domains for each variation and extension
      for (const variation of variations.slice(0, 20)) { // Limit to prevent too many results
        for (const { ext, price } of EXTENSIONS) {
          const domainName = `${variation}${ext}`;
          const isAvailable = await checkDomainAvailability(domainName);
          const registrar = REGISTRARS[Math.floor(Math.random() * REGISTRARS.length)];
          
          const domain = await storage.createDomain({
            name: domainName,
            extension: ext,
            price,
            isAvailable,
            isPremium: parseFloat(price) > 30,
            registrar: registrar.name,
            affiliateLink: `${registrar.affiliate}${domainName}`,
            description: `Perfect for ${keywords.join(', ')} related businesses`,
            tags: keywords,
            length: domainName.length,
          });
          
          domains.push(domain);
        }
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

      const isAvailable = await checkDomainAvailability(domain);
      
      // Update or create domain record
      let domainRecord = await storage.getDomainByName(domain);
      if (domainRecord) {
        domainRecord = await storage.updateDomainAvailability(domain, isAvailable);
      }
      
      res.json({ domain, isAvailable, record: domainRecord });
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
