import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Sliders } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Domain, DomainFilters } from "@shared/schema";

interface DomainSearchFormProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (loading: boolean) => void;
  onResults: (results: Domain[]) => void;
  filters: DomainFilters;
}

export default function DomainSearchForm({ 
  searchQuery, 
  onSearchQueryChange, 
  onSearch, 
  isSearching,
  setIsSearching,
  onResults,
  filters 
}: DomainSearchFormProps) {
  const { toast } = useToast();

  const exactSearchMutation = useMutation({
    mutationFn: async (exactDomain: string) => {
      const response = await fetch('/api/domains/check', {
        method: 'POST',
        body: JSON.stringify({ domain: exactDomain }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check domain availability');
      }
      
      return response.json();
    },
  });

  const generateDomainsMutation = useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters: DomainFilters }) => {
      const response = await fetch('/api/domains/generate', {
        method: 'POST',
        body: JSON.stringify({ query, filters }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate domains');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onResults(data.domains);
      setIsSearching(false);
      const availableCount = data.domains.filter((d: any) => d.isAvailable).length;
      toast({
        title: "Search Complete",
        description: `Found ${availableCount} available domains out of ${data.total} suggestions`,
      });
    },
    onError: (error) => {
      console.error('Search error:', error);
      setIsSearching(false);
      toast({
        title: "Search Failed",
        description: "Unable to generate domains. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter keywords or a domain name to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    onSearch(searchQuery);
    
    // Check if it's an exact domain search (contains a dot and valid extension)
    const isExactDomain = searchQuery.includes('.') && 
      (searchQuery.endsWith('.com') || searchQuery.endsWith('.net') || 
       searchQuery.endsWith('.org') || searchQuery.endsWith('.io') ||
       searchQuery.endsWith('.co') || searchQuery.endsWith('.tech') ||
       searchQuery.endsWith('.app') || searchQuery.endsWith('.dev') ||
       searchQuery.endsWith('.ai') || searchQuery.endsWith('.xyz') ||
       searchQuery.endsWith('.me') || searchQuery.endsWith('.info'));

    if (isExactDomain) {
      exactSearchMutation.mutate(searchQuery, {
        onSuccess: (data) => {
          onResults([data.domain]);
          setIsSearching(false);
          toast({
            title: "Domain Check Complete",
            description: `${data.domain.name} is ${data.domain.isAvailable ? 'available' : 'not available'}`,
          });
        },
        onError: (error) => {
          console.error('Exact domain check failed:', error);
          setIsSearching(false);
          toast({
            title: "Domain Check Failed",
            description: "Unable to check domain. Please try again.",
            variant: "destructive",
          });
        },
      });
    } else {
      generateDomainsMutation.mutate({ query: searchQuery, filters });
    }
  };

  const handleGenerateSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required", 
        description: "Please enter keywords to generate domains.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    onSearch(searchQuery);
    generateDomainsMutation.mutate({ query: searchQuery, filters });
  };

  const isExactDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(searchQuery.trim());

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Domain Search</h3>
          <p className="text-slate-600">Enter keywords to generate suggestions or search a specific domain</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="e.g., 'tech startup' or 'example.com'"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="text-lg h-14 px-6 border-2 border-slate-200 focus:border-brand-500 rounded-xl"
              disabled={isSearching}
            />
            {isExactDomain && (
              <div className="mt-2 text-sm text-brand-600 flex items-center gap-1">
                <Search className="h-4 w-4" />
                Exact domain detected - will check availability
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="h-14 px-8 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Search
                </>
              )}
            </Button>
            
            {!isExactDomain && (
              <Button
                type="button"
                onClick={handleGenerateSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
                className="h-14 px-8 border-2 border-purple-500 text-purple-500 hover:bg-purple-50 rounded-xl font-semibold flex items-center gap-2"
              >
                {generateDomainsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
