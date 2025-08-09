import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { User, Heart, UserPlus } from 'lucide-react';
import { Link } from 'wouter';

export function AuthButton() {
  const { isLoaded, user } = useUser();
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // If Clerk is not configured, show fallback buttons
  if (!clerkPubKey || !clerkPubKey.startsWith('pk_')) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Sign In (Disabled)
        </Button>
        <Button size="sm" disabled>
          Sign Up (Disabled)
        </Button>
      </div>
    );
  }
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-8 bg-slate-200 animate-pulse rounded"></div>
        <div className="w-20 h-8 bg-slate-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton 
          mode="modal"
          redirectUrl={typeof window !== 'undefined' ? window.location.href : '/'}
        >
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton 
          mode="modal"
          redirectUrl={typeof window !== 'undefined' ? window.location.href : '/'}
        >
          <Button size="sm" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Button>
        </SignUpButton>
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