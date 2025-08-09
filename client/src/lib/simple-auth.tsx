import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signIn: (email: string, name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  const value = {
    user,
    isSignedIn: !!user,
    isLoaded,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}