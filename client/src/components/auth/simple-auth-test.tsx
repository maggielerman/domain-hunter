import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, UserPlus, Heart, LogOut } from 'lucide-react';
import { Link } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

export function SimpleAuthTest() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check for stored user on load
    const storedUser = localStorage.getItem('domain-titans-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn('Invalid stored user data');
        localStorage.removeItem('domain-titans-user');
      }
    }
    setIsLoaded(true);
  }, []);

  const signIn = (email: string, name: string) => {
    const newUser = {
      id: Date.now().toString(),
      email,
      name
    };
    setUser(newUser);
    localStorage.setItem('domain-titans-user', JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('domain-titans-user');
  };

  const isSignedIn = !!user;

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-8 bg-slate-200 animate-pulse rounded"></div>
        <div className="w-20 h-8 bg-slate-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => signIn('test@example.com', 'Test User')}
        >
          <User className="w-4 h-4" />
          Sign In
        </Button>
        <Button 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => signIn('user@example.com', 'New User')}
        >
          <UserPlus className="w-4 h-4" />
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/favorites">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          My Favorites
        </Button>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {user?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/favorites">
              <Heart className="w-4 h-4 mr-2" />
              My Favorites
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}