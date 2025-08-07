import { pgTable, text, serial, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  extension: text("extension").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  registrar: text("registrar").notNull(),
  affiliateLink: text("affiliate_link"),
  registrarPricing: jsonb("registrar_pricing"), // Store all registrar prices
  description: text("description"),
  tags: text("tags").array(),
  length: serial("length").notNull(),
  checkedAt: timestamp("checked_at").defaultNow(),
});

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  filters: jsonb("filters"),
  resultsCount: serial("results_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  checkedAt: true,
}).extend({
  length: z.number().optional(),
  isAvailable: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  registrarPricing: z.record(z.object({
    price: z.number(),
    affiliateLink: z.string(),
    logo: z.string()
  })).optional(),
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
});

export const domainFiltersSchema = z.object({
  extensions: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  availableOnly: z.boolean().optional(),
  maxLength: z.number().optional(),
  sortBy: z.enum(['relevance', 'price-asc', 'price-desc', 'length', 'alphabetical', 'available-first']).optional(),
});

// Concept search schema
export const conceptSearches = pgTable("concept_searches", {
  id: serial("id").primaryKey(),
  businessConcept: text("business_concept").notNull(),
  analysis: jsonb("analysis"),
  suggestions: jsonb("suggestions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConceptSearchSchema = createInsertSchema(conceptSearches).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;
export type InsertConceptSearch = z.infer<typeof insertConceptSearchSchema>;
export type ConceptSearch = typeof conceptSearches.$inferSelect;
export type DomainFilters = z.infer<typeof domainFiltersSchema>;
