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
import { FavoriteButton } from "@/components/favorites/favorite-button";

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
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/concepts/enhance-domain`, {
        domain: domain.name,
        businessConcept
      });
      return await response.json();
    },
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
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1 flex-wrap">
              <h3 className="text-xs font-semibold text-slate-900 truncate">
                {domain.name}
              </h3>
              <Badge 
                variant={domain.isAvailable ? "default" : "destructive"}
                className="text-xs px-1 py-0"
              >
                {domain.isAvailable ? "Available" : "Taken"}
              </Badge>
              {domain.isPremium && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Premium
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-bold text-sm text-slate-900">
                ${domain.price}
              </span>
              <span className="text-xs">{domain.registrar}</span>
            </div>

            {domain.aiInsights && (
              <div className="space-y-2 mb-3 flex-1">
                <p className="text-xs text-slate-700 italic line-clamp-2">
                  "{domain.aiInsights.reasoning}"
                </p>
                
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className={`p-1 rounded text-center ${getScoreBg(domain.aiInsights.brandFit)}`}>
                    <div className="font-medium text-xs">Brand</div>
                    <div className={`font-bold text-xs ${getScoreColor(domain.aiInsights.brandFit)}`}>
                      {domain.aiInsights.brandFit}/10
                    </div>
                  </div>
                  
                  <div className={`p-1 rounded text-center ${getScoreBg(domain.aiInsights.memorability)}`}>
                    <div className="font-medium text-xs">Memory</div>
                    <div className={`font-bold text-xs ${getScoreColor(domain.aiInsights.memorability)}`}>
                      {domain.aiInsights.memorability}/10
                    </div>
                  </div>
                  
                  <div className={`p-1 rounded text-center ${getScoreBg(domain.aiInsights.seoValue)}`}>
                    <div className="font-medium text-xs">SEO</div>
                    <div className={`font-bold text-xs ${getScoreColor(domain.aiInsights.seoValue)}`}>
                      {domain.aiInsights.seoValue}/10
                    </div>
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

        <div className="flex gap-1 pt-2 border-t mt-auto">
          {businessConcept && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnhanceAnalysis}
              disabled={enhanceMutation.isPending}
              className="flex-1 text-xs px-1 py-1 h-7"
            >
              <Eye className="w-3 h-3 mr-1" />
              {enhanceMutation.isPending 
                ? "..." 
                : showEnhancement 
                  ? "Less" 
                  : "More"
              }
            </Button>
          )}
          
          <FavoriteButton 
            domainId={domain.id} 
            domainName={domain.name}
            size="sm"
            className="px-1 py-1 h-7"
          />
          
          <Button
            size="sm"
            onClick={() => {
              // Use affiliate link or fallback to GoDaddy
              const affiliateLink = (domain as any).affiliateLink || 
                (domain.registrarPricing && Object.values(domain.registrarPricing)[0] as any)?.affiliateLink;
              
              if (affiliateLink) {
                window.open(affiliateLink, '_blank');
              } else {
                // Final fallback to GoDaddy search
                window.open(`https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain.name}`, '_blank');
              }
            }}
            className="flex-1 text-xs px-1 py-1 h-7 bg-brand-600 hover:bg-brand-700"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}