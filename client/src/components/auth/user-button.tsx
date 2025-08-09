import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { User, Heart } from 'lucide-react';
import { Link } from 'wouter';

export function AuthButton() {
  const { isLoaded } = useUser();
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-200 animate-pulse rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Sign In
          </Button>
        </SignInButton>
        <SignInButton mode="modal">
          <Button size="sm">
            Sign Up
          </Button>
        </SignInButton>
      </SignedOut>
      
      <SignedIn>
        <Link href="/favorites">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            My Favorites
          </Button>
        </Link>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8"
            }
          }}
        />
      </SignedIn>
    </div>
  );
}