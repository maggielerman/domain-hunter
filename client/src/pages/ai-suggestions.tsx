import { useState, useEffect } from "react";
import ConceptSearch from "@/components/concept-search";
import AIDomainCard from "@/components/ai-domain-card";
import { Brain } from "lucide-react";
import TopNav from "@/components/navigation/top-nav";

export default function AISuggestions() {
  const [aiDomains, setAiDomains] = useState<any[]>([]);
  const [currentBusinessConcept, setCurrentBusinessConcept] = useState<string>("");
  const [conceptAnalysis, setConceptAnalysis] = useState<any>(null);
  const [isAutoSearching, setIsAutoSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<string>("");

  useEffect(() => {
    // Get business concept from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const concept = urlParams.get('concept');
    if (concept) {
      // Set the business concept and auto-trigger AI search
      setCurrentBusinessConcept(concept);
      triggerConceptSearch(concept);
    }
  }, []);

  const triggerConceptSearch = async (concept: string) => {
    setIsAutoSearching(true);
    setSearchProgress("Generating intelligent domain suggestions...");
    
    try {
      // Skip analysis and go straight to domain generation for speed
      const domainsResponse = await fetch('/api/concepts/generate-domains', {
        method: 'POST',
        body: JSON.stringify({ businessConcept: concept }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json();
        setSearchProgress("Checking domain availability...");
        setAiDomains(domainsData.domains);
        setCurrentBusinessConcept(concept);
        setSearchProgress("Complete! Found domain suggestions for you.");
        setTimeout(() => setSearchProgress(""), 2000);
      }
      
    } catch (error) {
      console.error('Auto AI search failed:', error);
      setSearchProgress("Search failed. Please try again.");
      setTimeout(() => setSearchProgress(""), 3000);
    } finally {
      setIsAutoSearching(false);
    }
  };

  const handleAiDomainsGenerated = (domains: any[], analysis: any) => {
    setAiDomains(domains);
    setConceptAnalysis(analysis);
    setCurrentBusinessConcept(domains[0]?.businessConcept || "");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav showBackButton={true} />

      {/* Page Header */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="text-purple-600 w-8 h-8" />
            <h1 className="text-3xl font-bold text-slate-900">AI Domain Suggestions</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Describe your business idea and let our AI generate intelligent domain name suggestions tailored to your concept.
          </p>
        </div>
      </section>

      {/* AI Search Interface */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isAutoSearching && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-6 py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <div className="text-purple-700">
                  <p className="font-semibold">AI Search in Progress</p>
                  <p className="text-sm">{searchProgress}</p>
                </div>
              </div>
            </div>
          )}
          
          <ConceptSearch 
            onDomainsGenerated={handleAiDomainsGenerated}
            initialConcept={currentBusinessConcept}
            disabled={isAutoSearching}
          />
        </div>
      </section>

      {/* AI Domain Results */}
      {aiDomains.length > 0 && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Brain className="text-purple-600 w-6 h-6" />
              <h2 className="text-2xl font-bold text-slate-900">
                AI-Generated Suggestions
              </h2>
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                {aiDomains.length} domains
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiDomains.map((domain, index) => (
                <AIDomainCard 
                  key={domain.id} 
                  domain={domain}
                  businessConcept={currentBusinessConcept}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {aiDomains.length === 0 && (
        <section className="py-16">
          <div className="text-center max-w-md mx-auto px-4">
            <Brain className="text-brand-400 w-16 h-16 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Ready to discover your perfect domain?
            </h3>
            <p className="text-slate-600">
              Enter your business concept above and let our AI generate intelligent domain suggestions that match your vision.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}