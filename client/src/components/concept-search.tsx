import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Lightbulb, Target, Users, Zap, Brain, Star, Filter, ChevronDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ViewToggle from "./view-toggle";
import DomainsTable from "./domains-table";
import AIDomainCard from "./ai-domain-card";

interface ConceptAnalysis {
  keywords: string[];
  industry: string;
  businessModel: string;
  targetAudience: string;
  brandPersonality: string[];
  suggestedDomainStyles: string[];
}

interface DomainSuggestion {
  domain: string;
  reasoning: string;
  brandFit: number;
  memorability: number;
  seoValue: number;
}

interface ConceptSearchProps {
  onDomainsGenerated: (domains: any[], analysis: ConceptAnalysis) => void;
  initialConcept?: string;
  disabled?: boolean;
}

export default function ConceptSearch({ onDomainsGenerated, initialConcept = "", disabled = false }: ConceptSearchProps) {
  const [businessConcept, setBusinessConcept] = useState(initialConcept);
  const [analysis, setAnalysis] = useState<ConceptAnalysis | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [domains, setDomains] = useState<any[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<any[]>([]);
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['.com', '.net', '.org', '.io']);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Available TLDs for filtering
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

  // Update businessConcept when initialConcept changes
  React.useEffect(() => {
    if (initialConcept) {
      setBusinessConcept(initialConcept);
    }
  }, [initialConcept]);

  // Filter domains based on selected criteria
  React.useEffect(() => {
    let filtered = domains;

    // Filter by TLD
    if (selectedTlds.length > 0) {
      filtered = filtered.filter(domain => {
        const domainTld = '.' + domain.name.split('.').pop();
        return selectedTlds.includes(domainTld);
      });
    }

    // Filter by availability
    if (availableOnly) {
      filtered = filtered.filter(domain => domain.isAvailable);
    }

    setFilteredDomains(filtered);
  }, [domains, selectedTlds, availableOnly]);

  const handleTldChange = (tld: string, checked: boolean) => {
    if (checked) {
      setSelectedTlds([...selectedTlds, tld]);
    } else {
      setSelectedTlds(selectedTlds.filter(t => t !== tld));
    }
  };

  const analyzeMutation = useMutation({
    mutationFn: async (concept: string) => {
      const response = await apiRequest("POST", `/api/concepts/analyze`, { businessConcept: concept });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setAnalysis(data.analysis);
      toast({
        title: "Concept Analyzed",
        description: "Your business concept has been analyzed. Now generating domain suggestions...",
      });
      // Automatically proceed to generate domains
      generateDomainsMutation.mutate(businessConcept);
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze your business concept. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateDomainsMutation = useMutation({
    mutationFn: async (concept: string) => {
      const response = await apiRequest("POST", `/api/concepts/generate-domains`, { 
        businessConcept: concept, 
        count: 25 
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setDomains(data.domains);
      onDomainsGenerated(data.domains, data.analysis);
      toast({
        title: "AI Domains Generated",
        description: `Generated ${data.domains.length} domain suggestions based on your concept.`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate domain suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessConcept.trim()) return;
    
    setAnalysis(null);
    analyzeMutation.mutate(businessConcept);
  };

  const isLoading = analyzeMutation.isPending || generateDomainsMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="text-brand-500 w-5 h-5" />
            AI-Powered Concept Search
          </CardTitle>
          <CardDescription>
            Describe your business idea and get intelligent domain suggestions tailored to your concept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="concept" className="text-sm font-medium text-slate-700">
                Describe Your Business Concept
              </label>
              <Textarea
                id="concept"
                placeholder="Example: I want to start a sustainable fashion marketplace that connects eco-conscious consumers with ethical clothing brands..."
                value={businessConcept}
                onChange={(e) => setBusinessConcept(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={disabled || isLoading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={disabled || !businessConcept.trim() || isLoading}
              className="w-full"
            >
              {disabled ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Search in Progress...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {analyzeMutation.isPending ? "Analyzing Concept..." : "Generating Domains..."}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate AI Domain Suggestions
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-amber-500 w-5 h-5" />
              Concept Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="text-blue-500 w-4 h-4" />
                  <h4 className="font-medium">Industry</h4>
                </div>
                <p className="text-sm text-slate-600">{analysis.industry}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="text-green-500 w-4 h-4" />
                  <h4 className="font-medium">Target Audience</h4>
                </div>
                <p className="text-sm text-slate-600">{analysis.targetAudience}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Business Model</h4>
              <p className="text-sm text-slate-600">{analysis.businessModel}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Key Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Brand Personality</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.brandPersonality.map((trait, index) => (
                  <Badge key={index} variant="outline">{trait}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Suggested Domain Styles</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedDomainStyles.map((style, index) => (
                  <Badge key={index} className="bg-brand-100 text-brand-700 hover:bg-brand-200">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {domains.length > 0 && (
        <div className="space-y-4">
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters & Options
                <ChevronDown className="w-4 h-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  {/* TLD Selection */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Domain Extensions</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {availableTlds.map((tld) => (
                        <div key={tld.ext} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tld-${tld.ext}`}
                            checked={selectedTlds.includes(tld.ext)}
                            onCheckedChange={(checked) => handleTldChange(tld.ext, checked as boolean)}
                          />
                          <label htmlFor={`tld-${tld.ext}`} className="text-xs font-medium text-slate-700">
                            {tld.ext}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Availability Filter */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="available-only"
                      checked={availableOnly}
                      onCheckedChange={setAvailableOnly}
                    />
                    <label htmlFor="available-only" className="text-sm font-medium text-slate-700">
                      Show available domains only
                    </label>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Domain Results with View Toggle */}
      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI-Generated Domain Suggestions ({filteredDomains.length} of {domains.length})</CardTitle>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </CardHeader>
          <CardContent>
            {filteredDomains.length > 0 ? (
              view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDomains.map((domain) => (
                    <AIDomainCard 
                      key={domain.id} 
                      domain={domain} 
                      businessConcept={businessConcept}
                    />
                  ))}
                </div>
              ) : (
                <DomainsTable domains={filteredDomains} />
              )
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No domains match your filters</h3>
                <p className="text-slate-600">Try adjusting your domain extension or availability filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}