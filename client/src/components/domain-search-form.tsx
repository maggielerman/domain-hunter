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
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['.com', '.net', '.org']);
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  const availableTlds = [
    { ext: '.com', price: '$12.99' },
    { ext: '.net', price: '$14.99' }, 
    { ext: '.org', price: '$13.99' },
    { ext: '.io', price: '$39.99' },
    { ext: '.co', price: '$29.99' },
    { ext: '.tech', price: '$49.99' },
    { ext: '.app', price: '$19.99' },
    { ext: '.dev', price: '$17.99' },
    { ext: '.ai', price: '$89.99' },
    { ext: '.xyz', price: '$2.99' },
    { ext: '.me', price: '$19.99' },
    { ext: '.info', price: '$19.99' }
  ];

  const handleTldChange = (tld: string, checked: boolean) => {
    if (checked) {
      setSelectedTlds([...selectedTlds, tld]);
    } else {
      setSelectedTlds(selectedTlds.filter(t => t !== tld));
    }
  };

  const domainSearchMutation = useMutation({
    mutationFn: async ({ domainName, tlds, availableOnly }: { domainName: string; tlds: string[]; availableOnly: boolean }) => {
      const response = await fetch('/api/domains/search-exact', {
        method: 'POST',
        body: JSON.stringify({ domainName, tlds, availableOnly }),
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

    if (selectedTlds.length === 0) {
      toast({
        title: "Select TLDs",
        description: "Please select at least one TLD to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    onSearch(searchQuery);
    
    // Remove any existing TLD from the search query
    const cleanDomainName = searchQuery.replace(/\.[a-z]+$/i, '').toLowerCase();
    
    domainSearchMutation.mutate({ 
      domainName: cleanDomainName, 
      tlds: selectedTlds, 
      availableOnly: showAvailableOnly 
    });
  };



  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Domain Search</h3>
          <p className="text-slate-600">Enter a domain name and select TLDs to check availability</p>
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

          {/* TLD Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select TLDs to check ({selectedTlds.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableTlds.map((tld) => (
                <div key={tld.ext} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                  <Checkbox
                    id={tld.ext}
                    checked={selectedTlds.includes(tld.ext)}
                    onCheckedChange={(checked) => handleTldChange(tld.ext, !!checked)}
                  />
                  <label htmlFor={tld.ext} className="flex-1 cursor-pointer">
                    <div className="font-medium text-sm">{tld.ext}</div>
                    <div className="text-xs text-slate-500">{tld.price}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
            <Checkbox
              id="available-only"
              checked={showAvailableOnly}
              onCheckedChange={(checked) => setShowAvailableOnly(!!checked)}
            />
            <label htmlFor="available-only" className="text-sm font-medium text-slate-700 cursor-pointer">
              Show available domains only
            </label>
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
