import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, UserPlus, Heart } from 'lucide-react';

// Simple fallback authentication component for testing
export function SimpleAuthTest() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const handleSignIn = () => {
    // Simulate sign in
    setUser({ name: 'Test User' });
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
  };

  return (
    <div className="flex items-center gap-3">
      {!isSignedIn ? (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleSignIn}
          >
            <User className="w-4 h-4" />
            Sign In
          </Button>
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleSignIn}
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            My Favorites
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.name?.[0] || 'U'}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </>
      )}
    </div>
  );
}