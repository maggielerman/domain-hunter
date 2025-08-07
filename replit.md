# Overview

Domain Titans is a comprehensive domain name discovery platform that helps entrepreneurs find and purchase domain names through intelligent search capabilities and real-time availability checking. The application generates creative domain variations using keyword-based patterns and integrates with major domain registrars through affiliate programs to monetize domain purchases.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built as a modern React single-page application using TypeScript and Vite for development tooling. The UI leverages Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. Client-side routing is handled by Wouter, providing a lightweight alternative to React Router. The application uses TanStack Query for server state management and caching of API responses.

## Backend Architecture
The server is an Express.js application that serves both API endpoints and the built frontend in production. The backend handles domain generation algorithms, availability checking through external APIs, and affiliate link generation. Domain checking is performed via DNS resolution and WHOIS API calls to determine availability status.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database stores domain search history, generated domain suggestions, and availability check results. For development convenience, an in-memory storage implementation is provided as a fallback when the database is unavailable.

The database schema includes:
- `domains` table: Stores domain names with metadata like pricing, availability, registrar info, and affiliate links
- `searches` table: Tracks user search queries and filters for analytics

## Domain Generation Engine
The core domain generation system creates variations using multiple strategies:
- Prefix/suffix combinations (get-, my-, -hub, -pro, etc.)
- Keyword combinations and permutations
- Popular extension alternatives (.com, .io, .tech, etc.)
- Length-based filtering and relevance scoring

## Affiliate Integration System
The platform monetizes through affiliate partnerships with major domain registrars. Each registrar integration includes:
- Custom tracking parameters and affiliate IDs
- Real-time pricing data for different extensions
- Branded purchase buttons with affiliate links
- Commission tracking for analytics

Supported registrars include GoDaddy, Namecheap, Hover, Porkbun, and Squarespace, each with specific affiliate URL structures and tracking requirements.

# External Dependencies

## Domain Availability APIs
- RapidAPI for WHOIS data and domain availability checking
- DNS resolution APIs for active website detection
- Custom availability determination logic combining multiple signals

## Database Infrastructure
- PostgreSQL database (configured for Neon serverless in production)
- Connection pooling and session management
- Drizzle ORM for schema management and migrations

## Affiliate Registrar APIs
- GoDaddy Partner API for domain search and pricing
- Namecheap affiliate tracking system
- Hover referral program integration
- Porkbun and Squarespace affiliate networks

## UI Component Libraries
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- Tailwind CSS for utility-first styling
- Class Variance Authority for component variants

## Development Tools
- Vite for fast development builds and hot module replacement
- TypeScript for type safety across the full stack
- ESBuild for production bundling
- Replit-specific development integrations