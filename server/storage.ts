import { domains, searches, type Domain, type InsertDomain, type Search, type InsertSearch, type DomainFilters } from "@shared/schema";

export interface IStorage {
  // Domain operations
  getDomain(id: number): Promise<Domain | undefined>;
  getDomainByName(name: string): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomainAvailability(name: string, isAvailable: boolean): Promise<Domain | undefined>;
  searchDomains(query: string, filters?: DomainFilters): Promise<Domain[]>;
  
  // Search operations
  createSearch(search: InsertSearch): Promise<Search>;
  getRecentSearches(limit?: number): Promise<Search[]>;
}

export class MemStorage implements IStorage {
  private domains: Map<number, Domain>;
  private searches: Map<number, Search>;
  private currentDomainId: number;
  private currentSearchId: number;

  constructor() {
    this.domains = new Map();
    this.searches = new Map();
    this.currentDomainId = 1;
    this.currentSearchId = 1;
  }

  async getDomain(id: number): Promise<Domain | undefined> {
    return this.domains.get(id);
  }

  async getDomainByName(name: string): Promise<Domain | undefined> {
    return Array.from(this.domains.values()).find(domain => domain.name === name);
  }

  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const id = this.currentDomainId++;
    const domain: Domain = {
      id,
      name: insertDomain.name,
      extension: insertDomain.extension,
      price: insertDomain.price,
      isAvailable: insertDomain.isAvailable ?? true,
      isPremium: insertDomain.isPremium ?? false,
      registrar: insertDomain.registrar,
      affiliateLink: insertDomain.affiliateLink || null,
      description: insertDomain.description || null,
      tags: insertDomain.tags || null,
      length: insertDomain.length || insertDomain.name.length,
      checkedAt: new Date(),
    };
    this.domains.set(id, domain);
    return domain;
  }

  async updateDomainAvailability(name: string, isAvailable: boolean): Promise<Domain | undefined> {
    const domain = await this.getDomainByName(name);
    if (domain) {
      domain.isAvailable = isAvailable;
      domain.checkedAt = new Date();
      this.domains.set(domain.id, domain);
      return domain;
    }
    return undefined;
  }

  async searchDomains(query: string, filters?: DomainFilters): Promise<Domain[]> {
    let results = Array.from(this.domains.values());

    // Filter by availability
    if (filters?.availableOnly) {
      results = results.filter(domain => domain.isAvailable);
    }

    // Filter by extensions
    if (filters?.extensions && filters.extensions.length > 0) {
      results = results.filter(domain => filters.extensions!.includes(domain.extension));
    }

    // Filter by price range
    if (filters?.minPrice !== undefined) {
      results = results.filter(domain => parseFloat(domain.price) >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      results = results.filter(domain => parseFloat(domain.price) <= filters.maxPrice!);
    }

    // Filter by length
    if (filters?.maxLength !== undefined) {
      results = results.filter(domain => domain.length <= filters.maxLength!);
    }

    // Search by query (domain name or tags)
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(domain => 
        domain.name.toLowerCase().includes(searchTerm) ||
        domain.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        domain.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort results
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price-desc':
          results.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'length':
          results.sort((a, b) => a.length - b.length);
          break;
        case 'alphabetical':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          // Keep relevance order (default)
          break;
      }
    }

    return results;
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = this.currentSearchId++;
    const search: Search = {
      id,
      query: insertSearch.query,
      filters: insertSearch.filters || {},
      resultsCount: insertSearch.resultsCount || 0,
      createdAt: new Date(),
    };
    this.searches.set(id, search);
    return search;
  }

  async getRecentSearches(limit: number = 10): Promise<Search[]> {
    return Array.from(this.searches.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
