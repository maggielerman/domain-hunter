import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Ruler, Tags, Calendar, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DomainAvailabilityBadge from "./domain-availability-badge";
import type { Domain } from "@shared/schema";

interface DomainCardProps {
  domain: Domain;
}

export default function DomainCard({ domain }: DomainCardProps) {
  const { toast } = useToast();

  const handlePurchase = () => {
    if (domain.affiliateLink && domain.isAvailable) {
      // Track affiliate click for analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'affiliate_click', {
          domain_name: domain.name,
          registrar: domain.registrar,
          price: domain.price
        });
      }
      
      window.open(domain.affiliateLink, '_blank', 'noopener,noreferrer');
      toast({
        title: "Redirecting to " + domain.registrar,
        description: "Complete your domain purchase on their secure platform.",
      });
    } else if (!domain.isAvailable) {
      toast({
        title: "Domain Not Available",
        description: "This domain is already registered by someone else.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Purchase Link Unavailable",
        description: "Please contact support for assistance.",
        variant: "destructive",
      });
    }
  };

  const handleFavorite = () => {
    toast({
      title: "Added to Favorites",
      description: `${domain.name} has been saved to your favorites.`,
    });
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numPrice);
  };

  const cardClasses = domain.isPremium
    ? "bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-amber-200 relative"
    : domain.isAvailable
    ? "bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-slate-200"
    : "bg-white rounded-xl shadow-lg p-6 border border-slate-200 opacity-75";

  return (
    <Card className={cardClasses}>
      {domain.isPremium && (
        <div className="absolute -top-3 left-6">
          <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400">
            <Star className="mr-1 h-3 w-3" />
            PREMIUM
          </Badge>
        </div>
      )}
      
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-xl font-semibold text-slate-900">{domain.name}</h4>
              <DomainAvailabilityBadge 
                isAvailable={domain.isAvailable} 
                registrar={domain.registrar}
              />
            </div>
            
            {domain.description && (
              <p className="text-slate-600 text-sm mb-3">{domain.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center">
                <Ruler className="mr-1 h-3 w-3" />
                {domain.length} characters
              </span>
              
              {domain.tags && domain.tags.length > 0 && (
                <span className="flex items-center">
                  <Tags className="mr-1 h-3 w-3" />
                  {domain.tags.slice(0, 2).join(', ')}
                </span>
              )}
              
              {domain.isPremium && (
                <span className="flex items-center text-amber-600">
                  <Star className="mr-1 h-3 w-3" />
                  Premium
                </span>
              )}
              
              {!domain.isAvailable && (
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  Registered
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:items-end space-y-3">
            <div className="text-right">
              {domain.isAvailable ? (
                <>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatPrice(domain.price)}
                  </div>
                  <div className="text-sm text-slate-500">
                    {domain.isPremium ? 'one-time fee' : 'per year'}
                  </div>
                </>
              ) : (
                <div className="text-lg text-slate-500">Not Available</div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {domain.isAvailable ? (
                <Button
                  onClick={handlePurchase}
                  className={
                    domain.isPremium
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "bg-brand-500 text-white hover:bg-brand-600"
                  }
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  {domain.isPremium ? 'Buy Premium' : 'Buy Now'}
                </Button>
              ) : (
                <Button disabled variant="secondary">
                  Unavailable
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavorite}
                className="hover:bg-slate-200"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
