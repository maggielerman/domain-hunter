import { useState, useEffect } from "react";
import { SimpleAuthTest } from "@/components/auth/simple-auth-test";
import ConceptSearch from "@/components/concept-search";
import AIDomainCard from "@/components/ai-domain-card";
import { Brain, Zap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AISuggestions() {
  const [aiDomains, setAiDomains] = useState<any[]>([]);
  const [currentBusinessConcept, setCurrentBusinessConcept] = useState<string>("");
  const [conceptAnalysis, setConceptAnalysis] = useState<any>(null);

  useEffect(() => {
    // Get business concept from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const concept = urlParams.get('concept');
    if (concept) {
      // Auto-trigger AI search with the concept
      triggerConceptSearch(concept);
    }
  }, []);

  const triggerConceptSearch = async (concept: string) => {
    try {
      // First, analyze the business concept
      const conceptResponse = await fetch('/api/concepts/analyze', {
        method: 'POST',
        body: JSON.stringify({ businessConcept: concept }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (conceptResponse.ok) {
        const conceptData = await conceptResponse.json();
        setConceptAnalysis(conceptData.analysis);
      }
      
      // Then generate AI domains based on the concept
      const domainsResponse = await fetch('/api/concepts/generate-domains', {
        method: 'POST',
        body: JSON.stringify({ businessConcept: concept }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json();
        setAiDomains(domainsData.domains);
        setCurrentBusinessConcept(concept);
      }
      
    } catch (error) {
      console.error('Auto AI search failed:', error);
    }
  };

  const handleAiDomainsGenerated = (domains: any[], analysis: any) => {
    setAiDomains(domains);
    setConceptAnalysis(analysis);
    setCurrentBusinessConcept(domains[0]?.businessConcept || "");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <ArrowLeft className="w-6 h-6 text-slate-600 hover:text-brand-500 cursor-pointer" />
              </Link>
              <div className="flex items-center space-x-2">
                <Zap className="text-brand-500 w-8 h-8" />
                <h1 className="text-2xl font-bold text-slate-900">Domain Titans</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/favorites" className="text-slate-600 hover:text-brand-500 font-medium">Favorites</Link>
                <a href="#" className="text-slate-600 hover:text-brand-500 font-medium">How it works</a>
                <a href="#" className="text-slate-600 hover:text-brand-500 font-medium">Support</a>
              </nav>
              <SimpleAuthTest />
            </div>
          </div>
        </div>
      </header>

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
          <ConceptSearch 
            onDomainsGenerated={handleAiDomainsGenerated}
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