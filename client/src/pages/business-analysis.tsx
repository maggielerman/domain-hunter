import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Lightbulb, Target, Users, TrendingUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/navigation/top-nav";

interface ConceptAnalysis {
  keywords: string[];
  industry: string;
  businessModel: string;
  targetAudience: string;
  brandPersonality: string[];
  suggestedDomainStyles: string[];
}

export default function BusinessAnalysis() {
  const [businessConcept, setBusinessConcept] = useState("");
  const [analysis, setAnalysis] = useState<ConceptAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (concept: string) => {
      const response = await apiRequest("POST", `/api/concepts/analyze`, { businessConcept: concept });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your business concept has been analyzed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze your business concept. Please try again.",
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

  const handleGenerateDomainsFromAnalysis = () => {
    // Navigate to AI suggestions page with the concept
    window.location.href = `/ai-suggestions?concept=${encodeURIComponent(businessConcept)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav showBackButton={true} />

      {/* Page Header */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="text-purple-600 w-8 h-8" />
            <h1 className="text-3xl font-bold text-slate-900">Business Concept Analysis</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get deep insights into your business idea with AI-powered analysis. Understand your market, audience, and branding opportunities.
          </p>
        </div>
      </section>

      {/* Analysis Interface */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-brand-500 w-5 h-5" />
                Analyze Your Business Concept
              </CardTitle>
              <CardDescription>
                Describe your business idea in detail and get comprehensive insights about your market, audience, and branding opportunities.
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
                    placeholder="Example: I want to start a sustainable fashion marketplace that connects eco-conscious consumers with ethical clothing brands. The platform will focus on transparency, allowing customers to see the full supply chain of each item..."
                    value={businessConcept}
                    onChange={(e) => setBusinessConcept(e.target.value)}
                    rows={6}
                    className="resize-none"
                    disabled={analyzeMutation.isPending}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!businessConcept.trim() || analyzeMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Your Business Concept...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Business Concept
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-amber-500 w-5 h-5" />
                  Business Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered insights about your business concept
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="text-blue-500 w-4 h-4" />
                      <h4 className="font-semibold">Industry & Market</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{analysis.industry}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="text-green-500 w-4 h-4" />
                      <h4 className="font-semibold">Target Audience</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{analysis.targetAudience}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Business Model</h4>
                  <p className="text-slate-600 leading-relaxed">{analysis.businessModel}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Key Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">{keyword}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Brand Personality</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.brandPersonality.map((trait, index) => (
                      <Badge key={index} variant="outline" className="text-sm">{trait}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Recommended Domain Styles</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedDomainStyles.map((style, index) => (
                      <Badge key={index} className="bg-brand-100 text-brand-700 hover:bg-brand-200 text-sm">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Generate Domains Button */}
                <div className="pt-6 border-t">
                  <Button 
                    onClick={handleGenerateDomainsFromAnalysis}
                    size="lg"
                    className="w-full bg-brand-600 hover:bg-brand-700"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Domain Names Based on This Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!analysis && !analyzeMutation.isPending && (
            <div className="text-center py-12">
              <Brain className="text-brand-400 w-16 h-16 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Ready to analyze your business idea?
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Enter your business concept above to get detailed insights about your market, audience, and branding opportunities.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}