import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Search, Brain, ArrowRight, Star, CheckCircle, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleDomainSearch = async () => {
    if (searchQuery.trim()) {
      // Use AI concept search by default - redirect to AI suggestions page with the concept
      window.location.href = `/ai-suggestions?concept=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Domain Search Bar - Top Section */}
      <section className="bg-slate-50 py-8 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <p className="text-lg text-slate-700 mb-2">
              <span className="font-semibold text-brand-600">AI-powered suggestions</span> — Describe your business and get intelligent domain ideas
            </p>
            <div className="space-x-4">
              <Link href="/search" className="text-brand-600 hover:text-brand-700 underline text-sm">
                Traditional keyword search
              </Link>
              <span className="text-slate-400">|</span>
              <Link href="/business-analysis" className="text-brand-600 hover:text-brand-700 underline text-sm">
                Get detailed business analysis
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Describe your business idea (e.g., 'online bakery', 'tech startup')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDomainSearch()}
                className="pl-12 pr-4 py-6 text-lg border-2 border-slate-200 focus:border-brand-500 rounded-xl shadow-sm"
              />
            </div>
            <Button 
              onClick={handleDomainSearch}
              size="lg"
              className="px-8 py-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl flex items-center gap-2"
            >
              <Brain className="w-5 h-5" />
              Generate AI Domains
            </Button>
          </div>
        </div>
      </section>

      {/* Hero Section - Centered with Background */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20 20h60v60H20z\" fill=\"%23f1f5f9\"/%3E%3C/svg%3E')"
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 mb-6">
              <Zap className="text-brand-400 w-10 h-10" />
              <span className="text-2xl font-bold">Domain Titans</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get a .com for only{" "}
              <span className="text-brand-400">$0.01*</span>/1st yr —
              <br />
              includes AI Intelligence
            </h1>
            <p className="text-xl mb-4 opacity-90">
              3-year purchase required. Additional years $21.99*
            </p>
          </div>
          
          {/* CTA Section */}
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-brand-100 rounded-lg px-3 py-1">
                  <span className="text-brand-600 font-semibold text-sm">AI POWERED</span>
                </div>
                <span className="text-slate-900 font-semibold">.com Domains</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">$0.01*/1st yr</div>
                <div className="text-xs text-slate-500">3-year purchase required</div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Link href="/ai-suggestions">
                <Button 
                  size="lg" 
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4"
                >
                  Generate AI Suggestions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose Domain Titans?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Advanced AI-powered domain discovery with real-time availability checking and competitive pricing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Intelligence</h3>
              <p className="text-slate-600">
                Describe your business idea and get intelligent domain suggestions powered by advanced AI algorithms.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-time Availability</h3>
              <p className="text-slate-600">
                Instant domain availability checking with live updates from multiple registrars worldwide.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Best Prices</h3>
              <p className="text-slate-600">
                Compare prices across all major registrars to find the best deals on your perfect domain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registrar Partners */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Compare Prices Across Multiple Registrars</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We show you prices from all major registrars so you can find the best deal for your domain.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            <div className="text-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              <div className="text-lg font-bold text-slate-700">GoDaddy</div>
              <div className="text-sm text-slate-500">From $17.99</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              <div className="text-lg font-bold text-slate-700">Namecheap</div>
              <div className="text-sm text-slate-500">From $13.98</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              <div className="text-lg font-bold text-slate-700">Hover</div>
              <div className="text-sm text-slate-500">From $15.99</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              <div className="text-lg font-bold text-slate-700">Porkbun</div>
              <div className="text-sm text-slate-500 text-green-600 font-medium">From $10.73</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              <div className="text-lg font-bold text-slate-700">Squarespace</div>
              <div className="text-sm text-slate-500">From $20.00</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="text-brand-400 w-8 h-8" />
                <h4 className="text-xl font-bold">Domain Titans</h4>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                The fastest way to find and secure your perfect domain name. Powered by advanced algorithms and real-time availability checking.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/ai-suggestions" className="hover:text-white transition-colors">AI Domain Generator</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Bulk Checker</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Domain Titans. All rights reserved. Affiliate disclosure: We may earn commissions from domain purchases.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}