import { SimpleAuthTest } from "@/components/auth/simple-auth-test";
import { Zap } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function TopNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const getLinkClasses = (path: string) => {
    return isActive(path) 
      ? "text-brand-600 hover:text-brand-700 font-medium"
      : "text-slate-600 hover:text-brand-500 font-medium";
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="text-brand-500 w-8 h-8" />
              <h1 className="text-2xl font-bold text-slate-900">Domain Titans</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/ai-suggestions" className={getLinkClasses('/ai-suggestions')}>
                AI Concept Search
              </Link>
              <Link href="/search" className={getLinkClasses('/search')}>
                Traditional Search
              </Link>
              <Link href="/business-analysis" className={getLinkClasses('/business-analysis')}>
                Business Analysis
              </Link>
              <Link href="/favorites" className={getLinkClasses('/favorites')}>
                Favorites
              </Link>
            </nav>
            <SimpleAuthTest />
          </div>
        </div>
      </div>
    </header>
  );
}