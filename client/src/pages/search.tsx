import { useState, useEffect } from "react";
import { SimpleAuthTest } from "@/components/auth/simple-auth-test";
import DomainSearchForm from "@/components/domain-search-form";
import DomainFilters from "@/components/domain-filters";
import DomainResults from "@/components/domain-results";
import { Zap, ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";
import type { DomainFilters as Filters, Domain } from "@shared/schema";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Domain[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    extensions: ['.com'],
    availableOnly: true,
    sortBy: 'relevance'
  });

  useEffect(() => {
    // Get search query from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
      // Auto-trigger search with the query
      triggerSearch(query);
    }
  }, []);

  const triggerSearch = (query: string) => {
    setIsSearching(true);
    // The DomainSearchForm will handle the actual search
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <ArrowLeft className="w-6 h-6 text-slate-600 hover:text-brand-500 cursor-pointer" />
              </Link>
              <div className="flex items-center space-x-2">
                <Zap className="text-brand-500 w-8 h-8" />
                <h1 className="text-2xl font-bold text-slate-900">Domain Titans</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/favorites" className="text-slate-600 hover:text-brand-500 font-medium">Favorites</Link>
                <Link href="/ai-suggestions" className="text-slate-600 hover:text-brand-500 font-medium">AI Suggestions</Link>
                <a href="#" className="text-slate-600 hover:text-brand-500 font-medium">Support</a>
              </nav>
              <SimpleAuthTest />
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Search className="text-brand-600 w-8 h-8" />
            <h1 className="text-3xl font-bold text-slate-900">Domain Search</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Search for available domains using keywords and advanced filtering options.
          </p>
        </div>
      </section>

      {/* Search Interface */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/4">
                <DomainFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
              
              <div className="lg:w-3/4">
                <DomainResults
                  results={searchResults}
                  isLoading={isSearching}
                  searchQuery={searchQuery}
                  filters={filters}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isSearching && searchQuery && (
        <section className="py-16">
          <div className="text-center max-w-md mx-auto px-4">
            <Search className="text-brand-400 w-16 h-16 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              No results found
            </h3>
            <p className="text-slate-600">
              Try adjusting your search terms or filters to find more domain options.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}