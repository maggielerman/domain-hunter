import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DomainCard from "./domain-card";
import type { Domain, DomainFilters } from "@shared/schema";

interface DomainResultsProps {
  results: Domain[];
  isLoading: boolean;
  searchQuery: string;
  filters: DomainFilters;
}

export default function DomainResults({ results, isLoading, searchQuery, filters }: DomainResultsProps) {
  // Apply filters to results
  const filteredResults = results.filter(domain => {
    // Filter by availability
    if (filters.availableOnly && !domain.isAvailable) {
      return false;
    }
    
    // Filter by extensions
    if (filters.extensions && filters.extensions.length > 0) {
      if (!filters.extensions.includes(domain.extension)) {
        return false;
      }
    }
    
    // Filter by price range
    const price = parseFloat(domain.price);
    if (filters.minPrice && price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && price > filters.maxPrice) {
      return false;
    }
    
    return true;
  });

  // Sort filtered results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'length':
        return a.name.length - b.name.length;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'relevance':
      default:
        return 0; // Keep original order for relevance
    }
  });

  if (isLoading) {
    return (
      <section className="flex-1">
        <Card className="mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96 mb-3" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!searchQuery && results.length === 0) {
    return (
      <section className="flex-1">
        <Card className="h-96 flex items-center justify-center">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Start Your Domain Search</h3>
            <p className="text-slate-600">Enter keywords above to generate domain suggestions</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (sortedResults.length === 0 && results.length > 0) {
    return (
      <section className="flex-1">
        <Card className="h-96 flex items-center justify-center">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Matching Domains</h3>
            <p className="text-slate-600">Try adjusting your filters to see more results</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="flex-1">
        <Card className="h-96 flex items-center justify-center">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Domains Found</h3>
            <p className="text-slate-600">Try different keywords or adjust your filters</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex-1">
      {/* Results Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {sortedResults.length.toLocaleString()} domains found
                {filteredResults.length !== results.length && (
                  <span className="text-sm text-slate-500 ml-2">
                    ({results.length} total)
                  </span>
                )}
              </h3>
              <p className="text-slate-600">
                Showing results for "{searchQuery}"
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-slate-600">Sort by:</label>
              <Select value={filters.sortBy || 'relevance'}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="length">Length: Short to Long</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Results */}
      <div className="space-y-4">
        {sortedResults.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>

      {/* Load More - placeholder for pagination */}
      {sortedResults.length >= 20 && (
        <div className="text-center mt-12">
          <button className="bg-white text-brand-500 border-2 border-brand-500 px-8 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors">
            Load More Results
          </button>
        </div>
      )}
    </section>
  );
}
