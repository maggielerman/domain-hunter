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
                {results.length.toLocaleString()} domains found
              </h3>
              <p className="text-slate-600">
                Showing results for "{searchQuery}"
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-slate-600">Sort by:</label>
              <Select defaultValue={filters.sortBy || 'relevance'}>
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
        {results.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>

      {/* Load More - placeholder for pagination */}
      {results.length >= 20 && (
        <div className="text-center mt-12">
          <button className="bg-white text-brand-500 border-2 border-brand-500 px-8 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors">
            Load More Results
          </button>
        </div>
      )}
    </section>
  );
}
