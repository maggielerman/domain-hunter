import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

export default function AffiliateSetupGuide() {
  const registrars = [
    {
      name: 'GoDaddy',
      signupUrl: 'https://www.godaddy.com/affiliates',
      commission: '15-30%',
      requirements: 'Active website, 90+ day cookie',
      envVars: ['GODADDY_AFFILIATE_ID', 'GODADDY_PLID'],
      difficulty: 'Medium'
    },
    {
      name: 'Namecheap',
      signupUrl: 'https://www.namecheap.com/affiliates',
      commission: '$0.50-$30 per domain',
      requirements: 'Active website, decent traffic',
      envVars: ['NAMECHEAP_AFFILIATE_ID'],
      difficulty: 'Easy'
    },
    {
      name: 'Hover',
      signupUrl: 'https://help.hover.com/hc/en-us/articles/217282137',
      commission: '$5-$15 per domain',
      requirements: 'Apply manually, quality content',
      envVars: ['HOVER_AFFILIATE_ID'],
      difficulty: 'Hard'
    },
    {
      name: 'Porkbun',
      signupUrl: 'https://porkbun.com/affiliates',
      commission: '$1-$5 per domain',
      requirements: 'Simple signup, good conversion',
      envVars: ['PORKBUN_AFFILIATE_ID'],
      difficulty: 'Easy'
    },
    {
      name: 'Squarespace',
      signupUrl: 'https://www.squarespace.com/circle',
      commission: '20% recurring',
      requirements: 'Circle member, quality referrals',
      envVars: ['SQUARESPACE_AFFILIATE_ID'],
      difficulty: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Affiliate Setup Guide</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          To monetize your domain generator, you'll need to sign up for affiliate programs with domain registrars. 
          Here's how to set up each one:
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {registrars.map((registrar) => (
          <Card key={registrar.name} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{registrar.name}</CardTitle>
                <Badge variant={
                  registrar.difficulty === 'Easy' ? 'default' : 
                  registrar.difficulty === 'Medium' ? 'secondary' : 'destructive'
                }>
                  {registrar.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-900">Commission</div>
                <div className="text-sm text-slate-600">{registrar.commission}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-slate-900">Requirements</div>
                <div className="text-sm text-slate-600">{registrar.requirements}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-slate-900 mb-2">Environment Variables</div>
                <div className="space-y-1">
                  {registrar.envVars.map((envVar) => (
                    <code key={envVar} className="block text-xs bg-slate-100 px-2 py-1 rounded">
                      {envVar}
                    </code>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => window.open(registrar.signupUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Setup Instructions</h3>
              <div className="text-sm text-blue-800 mt-2 space-y-2">
                <p>1. Sign up for affiliate programs with the registrars above</p>
                <p>2. Once approved, add your affiliate IDs to the environment variables</p>
                <p>3. The system will automatically generate proper affiliate links</p>
                <p>4. Track your earnings through each registrar's affiliate dashboard</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}