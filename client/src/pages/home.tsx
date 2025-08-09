import { useState } from "react";
import DomainSearchForm from "@/components/domain-search-form";
import DomainFilters from "@/components/domain-filters";
import DomainResults from "@/components/domain-results";
import ConceptSearch from "@/components/concept-search";
import AIDomainCard from "@/components/ai-domain-card";
import { Globe, Search, Sliders, Zap, Brain, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { DomainFilters as Filters, Domain } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Domain[]>([]);
  const [aiDomains, setAiDomains] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    extensions: ['.com'],
    availableOnly: true,
    sortBy: 'relevance'
  });
  const [currentBusinessConcept, setCurrentBusinessConcept] = useState<string>("");
  const [conceptAnalysis, setConceptAnalysis] = useState<any>(null);

  const quickSearches = ['tech startup', 'creative agency', 'online store'];

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAiDomainsGenerated = (domains: any[], analysis: any) => {
    setAiDomains(domains);
    setConceptAnalysis(analysis);
    // Clear traditional search results when AI results are shown
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Zap className="text-brand-500 w-8 h-8" />
              <h1 className="text-xl font-bold text-slate-900">Domain Titans</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-brand-500 font-medium">How it works</a>
              <a href="/affiliate-setup" className="text-slate-600 hover:text-brand-500 font-medium">Affiliate Setup</a>
              <a href="#" className="text-slate-600 hover:text-brand-500 font-medium">Support</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Title and Description */}
            <div className="text-left">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Find Your Perfect
                <span className="text-brand-500"> Domain Name</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 max-w-lg">
                Describe your business idea for AI-powered suggestions, or search by keywords for traditional domain generation.
              </p>
              
              {/* Quick search suggestions */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-500 text-sm">Popular searches:</span>
                {quickSearches.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(suggestion)}
                    className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-full hover:border-brand-300 hover:bg-brand-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Search Interface */}
            <div className="w-full">
              <Tabs defaultValue="concept" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="concept" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Concept Search
                    <Badge variant="secondary" className="text-xs">NEW</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="keyword" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Keyword Search
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="concept">
                  <ConceptSearch 
                    onDomainsGenerated={(domains, analysis) => {
                      handleAiDomainsGenerated(domains, analysis);
                      setCurrentBusinessConcept(domains[0]?.businessConcept || "");
                    }} 
                  />
                </TabsContent>
                
                <TabsContent value="keyword">
                  <div className="w-full">
                    <DomainSearchForm
                      searchQuery={searchQuery}
                      onSearchQueryChange={setSearchQuery}
                      onSearch={(query) => {
                        setSearchQuery(query);
                        setIsSearching(true);
                      }}
                      isSearching={isSearching}
                      setIsSearching={setIsSearching}
                      onResults={setSearchResults}
                      filters={filters}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 py-12">
        {/* AI Domain Results */}
        {aiDomains.length > 0 && (
          <section className="mb-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="text-purple-600 w-6 h-6" />
              <h3 className="text-2xl font-bold text-slate-900 text-left">
                AI-Generated Domain Suggestions
              </h3>
              <Badge className="bg-purple-100 text-purple-700">
                {aiDomains.length} domains
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiDomains.map((domain, index) => (
                <AIDomainCard 
                  key={domain.id} 
                  domain={domain}
                  businessConcept={currentBusinessConcept}
                />
              ))}
            </div>
          </section>
        )}

        {/* Traditional Search Results */}
        {searchResults.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 min-h-0 px-4 sm:px-6 lg:px-8">
            <DomainFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            <DomainResults
              results={searchResults}
              isLoading={isSearching}
              searchQuery={searchQuery}
              filters={filters}
            />
          </div>
        )}

        {/* Welcome message when no results */}
        {searchResults.length === 0 && aiDomains.length === 0 && (
          <div className="text-left py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md">
              <Zap className="text-brand-400 w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Ready to find your perfect domain?
              </h3>
              <p className="text-slate-600">
                Try our AI-powered concept search to get intelligent suggestions based on your business idea, or use keyword search for traditional domain generation.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Registrar Partners */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Compare Prices Across Multiple Registrars</h3>
            <p className="text-slate-600 max-w-2xl">
              We show you prices from all major registrars so you can find the best deal for your domain.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="text-lg font-bold text-slate-700">GoDaddy</div>
              <div className="text-sm text-slate-500">From $17.99</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="text-lg font-bold text-slate-700">Namecheap</div>
              <div className="text-sm text-slate-500">From $13.98</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="text-lg font-bold text-slate-700">Hover</div>
              <div className="text-sm text-slate-500">From $15.99</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="text-lg font-bold text-slate-700">Porkbun</div>
              <div className="text-sm text-slate-500 text-green-600 font-medium">From $10.73</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="text-lg font-bold text-slate-700">Squarespace</div>
              <div className="text-sm text-slate-500">From $20.00</div>
            </div>
          </div>
          <div className="text-left mt-8">
            <p className="text-sm text-slate-500">
              Click "Compare Prices" on any available domain to see all registrar options with direct purchase links.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="text-brand-400 w-8 h-8" />
                <h4 className="text-xl font-bold">Domain Titans</h4>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                The fastest way to find and secure your perfect domain name. Powered by advanced algorithms and real-time availability checking.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Domain Search</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bulk Checker</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Domain Generator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 DomainFinder. All rights reserved. Affiliate disclosure: We may earn commissions from domain purchases.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
