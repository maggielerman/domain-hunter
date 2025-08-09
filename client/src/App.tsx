import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AffiliateSetup from "@/pages/affiliate-setup";
import Favorites from "@/pages/favorites";
import AISuggestions from "@/pages/ai-suggestions";
import SearchPage from "@/pages/search";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/affiliate-setup" component={AffiliateSetup} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/ai-suggestions" component={AISuggestions} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
