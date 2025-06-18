import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Domain } from "@shared/schema";

interface RegistrarPricingProps {
  domain: Domain;
}

export default function RegistrarPricing({ domain }: RegistrarPricingProps) {
  const { toast } = useToast();

  if (!domain.isAvailable || !domain.registrarPricing) {
    return null;
  }

  const registrars = Object.entries(domain.registrarPricing as Record<string, any>)
    .map(([name, data]) => ({
      name,
      price: data.price,
      affiliateLink: data.affiliateLink,
      logo: data.logo
    }))
    .sort((a, b) => a.price - b.price); // Sort by price, cheapest first

  const handlePurchase = (registrar: any) => {
    // Track affiliate click for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        domain_name: domain.name,
        registrar: registrar.name,
        price: registrar.price
      });
    }
    
    window.open(registrar.affiliateLink, '_blank', 'noopener,noreferrer');
    toast({
      title: "Redirecting to " + registrar.name,
      description: "Complete your domain purchase on their secure platform.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <span>Available at {registrars.length} Registrars</span>
          {registrars.length > 0 && (
            <Badge className="ml-2 bg-green-100 text-green-800">
              Best: {formatPrice(registrars[0].price)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {registrars.map((registrar, index) => (
            <div 
              key={registrar.name}
              className={`p-4 border rounded-lg ${
                index === 0 ? 'border-green-500 bg-green-50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-xs font-bold">
                    {registrar.name.charAt(0)}
                  </div>
                  <span className="font-medium">{registrar.name}</span>
                  {index === 0 && (
                    <Star className="h-4 w-4 text-green-600 fill-current" />
                  )}
                </div>
              </div>
              
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-slate-900">
                  {formatPrice(registrar.price)}
                </div>
                <div className="text-sm text-slate-500">per year</div>
              </div>
              
              <Button
                onClick={() => handlePurchase(registrar)}
                className={`w-full ${
                  index === 0 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                }`}
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                {index === 0 ? 'Best Deal' : 'Buy Now'}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-slate-500 text-center">
          Prices shown are current as of last update and may vary. Click to see current pricing on registrar websites.
        </div>
      </CardContent>
    </Card>
  );
}