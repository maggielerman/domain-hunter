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
      const response = await apiRequest('/api/domains/check', {
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
      const response = await apiRequest('/api/domains/generate', {
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
    
    onSearch(searchQuery);
    generateDomainsMutation.mutate({ query: searchQuery, filters });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Enter keywords or exact domain (e.g., 'mycompany.com' or 'tech startup')"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors h-14"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            type="submit"
            disabled={isSearching}
            className="bg-brand-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors h-12"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isSearching ? "Generating..." : "Generate Domains"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-white text-brand-500 border-2 border-brand-500 px-8 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors h-12"
          >
            <Sliders className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        </div>
      </form>
    </div>
  );
}
