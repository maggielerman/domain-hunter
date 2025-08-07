# Titan Domains

A comprehensive domain name discovery platform built with React and Node.js that helps entrepreneurs find the perfect web address with intelligent search capabilities and real-time availability tracking.

## Features
- Intelligent domain name generation with multiple variation patterns
- Real-time availability checking via DNS and WHOIS APIs
- Affiliate integration with major registrars (GoDaddy, Namecheap, Hover, Porkbun, Squarespace)
- Advanced filtering by price, length, and extension
- Modern responsive UI with dark mode support
- PostgreSQL database for search history and domain tracking

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Wouter routing
- **Backend**: Node.js, Express, Drizzle ORM
- **Database**: PostgreSQL
- **APIs**: Domain availability checking, WHOIS data
- **UI Components**: Shadcn/ui, Lucide icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy .env.example to .env and fill in your API keys
RAPIDAPI_KEY=your_rapidapi_key_here
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript schemas
├── components.json  # Shadcn UI configuration
└── drizzle.config.ts # Database configuration
```

## Domain Generation Features
- Keyword-based variations (prefixes, suffixes, combinations)
- Number and hyphen integration
- Multiple extension support (.com, .io, .co, etc.)
- Smart availability estimation
- Affiliate monetization ready

## API Endpoints
- `POST /api/domains/generate` - Generate domain variations
- `POST /api/domains/check` - Check individual domain availability
- `GET /api/domains/search` - Search existing domains

## Contributing
This project uses modern web development practices with TypeScript, React hooks, and server-side rendering capabilities through Replit's infrastructure.