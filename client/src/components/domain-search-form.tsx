import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

  const domainSearchMutation = useMutation({
    mutationFn: async ({ domainName }: { domainName: string }) => {
      const response = await fetch('/api/domains/search-exact', {
        method: 'POST',
        body: JSON.stringify({ 
          domainName, 
          tlds: ['.com', '.net', '.org', '.io', '.co', '.tech', '.app', '.dev', '.ai', '.xyz', '.me', '.info'], 
          availableOnly: false 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to search domains');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onResults(data.domains);
      setIsSearching(false);
      const availableCount = data.domains.filter((d: any) => d.isAvailable).length;
      toast({
        title: "Domain Search Complete",
        description: `Found ${availableCount} available domains out of ${data.domains.length} checked`,
      });
    },
    onError: (error) => {
      console.error('Domain search error:', error);
      setIsSearching(false);
      toast({
        title: "Search Failed",
        description: "Unable to search domains. Please try again.",
        variant: "destructive",
      });
    },
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Domain Name Required",
        description: "Please enter a domain name to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    onSearch(searchQuery);
    
    // Remove any existing TLD from the search query
    const cleanDomainName = searchQuery.replace(/\.[a-z]+$/i, '').toLowerCase();
    
    domainSearchMutation.mutate({ 
      domainName: cleanDomainName
    });
  };



  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Domain Search</h3>
          <p className="text-slate-600">Enter a domain name to check availability across all extensions</p>
        </div>

        <div className="space-y-4">
          {/* Domain name input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Domain Name
            </label>
            <Input
              type="text"
              placeholder="e.g., 'mycompany' (without TLD)"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="text-lg h-12 px-4 border-2 border-slate-200 focus:border-brand-500 rounded-lg"
              disabled={isSearching}
            />
          </div>


        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSearching || !searchQuery.trim() || selectedTlds.length === 0}
            className="h-12 px-8 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Search Domains
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
