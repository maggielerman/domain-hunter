import { 
  domains, 
  searches, 
  conceptSearches, 
  users,
  domainLists,
  favorites,
  type Domain, 
  type InsertDomain, 
  type Search, 
  type InsertSearch, 
  type ConceptSearch, 
  type InsertConceptSearch, 
  type User,
  type InsertUser,
  type DomainList,
  type InsertDomainList,
  type Favorite,
  type InsertFavorite,
  type DomainFilters 
} from "@shared/schema";

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
  
  // Concept search operations
  createConceptSearch(conceptSearch: InsertConceptSearch): Promise<ConceptSearch>;
  getRecentConceptSearches(limit?: number): Promise<ConceptSearch[]>;
  
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Domain Lists operations
  createDomainList(list: InsertDomainList): Promise<DomainList>;
  getUserDomainLists(userId: string): Promise<DomainList[]>;
  getDomainList(id: number): Promise<DomainList | undefined>;
  updateDomainList(id: number, updates: Partial<InsertDomainList>): Promise<DomainList | undefined>;
  deleteDomainList(id: number): Promise<boolean>;
  
  // Favorites operations
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, domainId: number): Promise<boolean>;
  getUserFavorites(userId: string, listId?: number): Promise<(Favorite & { domain: Domain })[]>;
  isFavorited(userId: string, domainId: number): Promise<boolean>;
}

import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getDomain(id: number): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain || undefined;
  }

  async getDomainByName(name: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.name, name));
    return domain || undefined;
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [newDomain] = await db
      .insert(domains)
      .values({
        ...domain,
        length: domain.name.length
      })
      .returning();
    return newDomain;
  }

  async updateDomainAvailability(name: string, isAvailable: boolean): Promise<Domain | undefined> {
    const [updated] = await db
      .update(domains)
      .set({ isAvailable, checkedAt: new Date() })
      .where(eq(domains.name, name))
      .returning();
    return updated || undefined;
  }

  async searchDomains(query: string, filters?: DomainFilters): Promise<Domain[]> {
    // For now, return empty array - implement search logic as needed
    return [];
  }

  async createSearch(search: InsertSearch): Promise<Search> {
    const [newSearch] = await db
      .insert(searches)
      .values(search)
      .returning();
    return newSearch;
  }

  async getRecentSearches(limit = 10): Promise<Search[]> {
    return await db
      .select()
      .from(searches)
      .orderBy(desc(searches.createdAt))
      .limit(limit);
  }

  async createConceptSearch(conceptSearch: InsertConceptSearch): Promise<ConceptSearch> {
    const [newConceptSearch] = await db
      .insert(conceptSearches)
      .values(conceptSearch)
      .returning();
    return newConceptSearch;
  }

  async getRecentConceptSearches(limit = 10): Promise<ConceptSearch[]> {
    return await db
      .select()
      .from(conceptSearches)
      .orderBy(desc(conceptSearches.createdAt))
      .limit(limit);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async createDomainList(list: InsertDomainList): Promise<DomainList> {
    const [newList] = await db
      .insert(domainLists)
      .values(list)
      .returning();
    return newList;
  }

  async getUserDomainLists(userId: string): Promise<DomainList[]> {
    return await db
      .select()
      .from(domainLists)
      .where(eq(domainLists.userId, userId))
      .orderBy(desc(domainLists.createdAt));
  }

  async getDomainList(id: number): Promise<DomainList | undefined> {
    const [list] = await db.select().from(domainLists).where(eq(domainLists.id, id));
    return list || undefined;
  }

  async updateDomainList(id: number, updates: Partial<InsertDomainList>): Promise<DomainList | undefined> {
    const [updated] = await db
      .update(domainLists)
      .set(updates)
      .where(eq(domainLists.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDomainList(id: number): Promise<boolean> {
    const result = await db.delete(domainLists).where(eq(domainLists.id, id));
    return result.rowCount > 0;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, domainId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.domainId, domainId)
      ));
    return result.rowCount > 0;
  }

  async getUserFavorites(userId: string, listId?: number): Promise<(Favorite & { domain: Domain })[]> {
    let conditions = [eq(favorites.userId, userId)];
    if (listId !== undefined) {
      conditions.push(eq(favorites.listId, listId));
    }

    const results = await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        domainId: favorites.domainId,
        listId: favorites.listId,
        notes: favorites.notes,
        createdAt: favorites.createdAt,
        domain: domains
      })
      .from(favorites)
      .innerJoin(domains, eq(favorites.domainId, domains.id))
      .where(and(...conditions))
      .orderBy(desc(favorites.createdAt));

    return results;
  }

  async isFavorited(userId: string, domainId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.domainId, domainId)
      ));
    return !!favorite;
  }
}

export class MemStorage implements IStorage {
  private domains: Map<number, Domain>;
  private searches: Map<number, Search>;
  private conceptSearches: Map<number, ConceptSearch>;
  private users: Map<string, User>;
  private domainLists: Map<number, DomainList>;
  private favorites: Map<number, Favorite>;
  private currentDomainId: number;
  private currentSearchId: number;
  private currentConceptSearchId: number;
  private currentListId: number;
  private currentFavoriteId: number;

  constructor() {
    this.domains = new Map();
    this.searches = new Map();
    this.conceptSearches = new Map();
    this.users = new Map();
    this.domainLists = new Map();
    this.favorites = new Map();
    this.currentDomainId = 1;
    this.currentSearchId = 1;
    this.currentConceptSearchId = 1;
    this.currentListId = 1;
    this.currentFavoriteId = 1;
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
      registrarPricing: insertDomain.registrarPricing || null,
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

  async createConceptSearch(insertConceptSearch: InsertConceptSearch): Promise<ConceptSearch> {
    const id = this.currentConceptSearchId++;
    const conceptSearch: ConceptSearch = {
      id,
      businessConcept: insertConceptSearch.businessConcept,
      analysis: insertConceptSearch.analysis || null,
      suggestions: insertConceptSearch.suggestions || null,
      createdAt: new Date(),
    };
    this.conceptSearches.set(id, conceptSearch);
    return conceptSearch;
  }

  async getRecentConceptSearches(limit: number = 10): Promise<ConceptSearch[]> {
    return Array.from(this.conceptSearches.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  // User operations
  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: insertUser.id,
      email: insertUser.email,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      imageUrl: insertUser.imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    
    // Create default "My Favorites" list
    await this.createDomainList({
      userId: user.id,
      name: "My Favorites",
      description: "Your favorite domains",
      isDefault: true,
    });
    
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Domain Lists operations
  async createDomainList(insertList: InsertDomainList): Promise<DomainList> {
    const id = this.currentListId++;
    const list: DomainList = {
      id,
      userId: insertList.userId,
      name: insertList.name,
      description: insertList.description || null,
      isDefault: insertList.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.domainLists.set(id, list);
    return list;
  }

  async getUserDomainLists(userId: string): Promise<DomainList[]> {
    return Array.from(this.domainLists.values()).filter(list => list.userId === userId);
  }

  async getDomainList(id: number): Promise<DomainList | undefined> {
    return this.domainLists.get(id);
  }

  async updateDomainList(id: number, updates: Partial<InsertDomainList>): Promise<DomainList | undefined> {
    const list = this.domainLists.get(id);
    if (!list) return undefined;
    
    const updatedList = { ...list, ...updates, updatedAt: new Date() };
    this.domainLists.set(id, updatedList);
    return updatedList;
  }

  async deleteDomainList(id: number): Promise<boolean> {
    return this.domainLists.delete(id);
  }

  // Favorites operations
  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      id,
      userId: insertFavorite.userId,
      domainId: insertFavorite.domainId as number,
      listId: insertFavorite.listId as number,
      notes: insertFavorite.notes || null,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: string, domainId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      f => f.userId === userId && f.domainId === domainId
    );
    if (!favorite) return false;
    return this.favorites.delete(favorite.id);
  }

  async getUserFavorites(userId: string, listId?: number): Promise<(Favorite & { domain: Domain })[]> {
    const userFavorites = Array.from(this.favorites.values()).filter(f => {
      if (f.userId !== userId) return false;
      if (listId && f.listId !== listId) return false;
      return true;
    });
    
    const favoritesWithDomains = await Promise.all(
      userFavorites.map(async (favorite) => {
        const domain = await this.getDomain(favorite.domainId);
        return { ...favorite, domain: domain! };
      })
    );
    
    return favoritesWithDomains.filter(f => f.domain);
  }

  async isFavorited(userId: string, domainId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      f => f.userId === userId && f.domainId === domainId
    );
  }
}

export const storage = new DatabaseStorage();
