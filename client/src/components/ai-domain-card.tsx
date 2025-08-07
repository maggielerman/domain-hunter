import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Brain,
  Search,
  Eye
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIDomainCardProps {
  domain: {
    id: number;
    name: string;
    extension: string;
    price: string;
    isAvailable: boolean;
    isPremium: boolean;
    registrar: string;
    description: string;
    registrarPricing?: Record<string, any>;
    aiInsights?: {
      reasoning: string;
      brandFit: number;
      memorability: number;
      seoValue: number;
    };
  };
  businessConcept?: string;
}

export default function AIDomainCard({ domain, businessConcept }: AIDomainCardProps) {
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [enhancement, setEnhancement] = useState<any>(null);

  const enhanceMutation = useMutation({
    mutationFn: () => apiRequest(`/api/concepts/enhance-domain`, "POST", {
      domain: domain.name,
      businessConcept
    }),
    onSuccess: (data: any) => {
      setEnhancement(data.enhancement);
      setShowEnhancement(true);
    },
  });

  const handleEnhanceAnalysis = () => {
    if (enhancement) {
      setShowEnhancement(!showEnhancement);
    } else {
      enhanceMutation.mutate();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900 break-all">
                {domain.name}
              </h3>
              <Badge 
                variant={domain.isAvailable ? "default" : "destructive"}
                className="text-xs"
              >
                {domain.isAvailable ? "Available" : "Taken"}
              </Badge>
              {domain.isPremium && (
                <Badge variant="secondary" className="text-xs">
                  Premium
                </Badge>
              )}
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                <Brain className="w-3 h-3 mr-1" />
                AI
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
              <span className="font-medium text-lg text-slate-900">
                ${domain.price}
              </span>
              <span>{domain.registrar}</span>
            </div>

            {domain.aiInsights && (
              <div className="space-y-3 mb-4">
                <p className="text-sm text-slate-700 italic">
                  "{domain.aiInsights.reasoning}"
                </p>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className={`p-2 rounded ${getScoreBg(domain.aiInsights.brandFit)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Brand Fit</span>
                      <span className={`font-bold ${getScoreColor(domain.aiInsights.brandFit)}`}>
                        {domain.aiInsights.brandFit}/10
                      </span>
                    </div>
                    <Progress 
                      value={domain.aiInsights.brandFit * 10} 
                      className="h-1"
                    />
                  </div>
                  
                  <div className={`p-2 rounded ${getScoreBg(domain.aiInsights.memorability)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Memorable</span>
                      <span className={`font-bold ${getScoreColor(domain.aiInsights.memorability)}`}>
                        {domain.aiInsights.memorability}/10
                      </span>
                    </div>
                    <Progress 
                      value={domain.aiInsights.memorability * 10} 
                      className="h-1"
                    />
                  </div>
                  
                  <div className={`p-2 rounded ${getScoreBg(domain.aiInsights.seoValue)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">SEO Value</span>
                      <span className={`font-bold ${getScoreColor(domain.aiInsights.seoValue)}`}>
                        {domain.aiInsights.seoValue}/10
                      </span>
                    </div>
                    <Progress 
                      value={domain.aiInsights.seoValue * 10} 
                      className="h-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {showEnhancement && enhancement && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                <h4 className="font-medium text-slate-900">Enhanced Analysis</h4>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-slate-700">Branding Insights</h5>
                  <p className="text-sm text-slate-600">{enhancement.brandingInsights}</p>
                </div>

                {enhancement.marketingAngles && enhancement.marketingAngles.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-700">Marketing Opportunities</h5>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {enhancement.marketingAngles.map((angle: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          {angle}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {enhancement.potentialConcerns && enhancement.potentialConcerns.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-700">Potential Concerns</h5>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {enhancement.potentialConcerns.map((concern: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {businessConcept && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnhanceAnalysis}
              disabled={enhanceMutation.isPending}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              {enhanceMutation.isPending 
                ? "Analyzing..." 
                : showEnhancement 
                  ? "Hide Analysis" 
                  : "Deep Analysis"
              }
            </Button>
          )}
          
          {domain.registrarPricing && Object.keys(domain.registrarPricing).length > 0 && (
            <Button variant="outline" size="sm" className="flex-1">
              Compare Prices
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={() => window.open(`https://google.com/search?q=${domain.name}`, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Check Domain
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}