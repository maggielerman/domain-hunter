import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { User, Heart } from 'lucide-react';
import { Link } from 'wouter';

export function AuthButton() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
      
      <SignedIn>
        <Link href="/favorites">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            My Lists
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