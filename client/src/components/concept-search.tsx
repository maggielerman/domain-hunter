import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, Target, Users, Zap, Brain, Star } from "lucide-react";
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
}



export default function ConceptSearch({ onDomainsGenerated }: ConceptSearchProps) {
  const [businessConcept, setBusinessConcept] = useState("");
  const [analysis, setAnalysis] = useState<ConceptAnalysis | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [domains, setDomains] = useState<any[]>([]);
  const { toast } = useToast();

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
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!businessConcept.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
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

      {/* Domain Results with View Toggle */}
      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI-Generated Domain Suggestions ({domains.length})</CardTitle>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </CardHeader>
          <CardContent>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((domain) => (
                  <AIDomainCard 
                    key={domain.id} 
                    domain={domain} 
                    businessConcept={businessConcept}
                  />
                ))}
              </div>
            ) : (
              <DomainsTable domains={domains} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}