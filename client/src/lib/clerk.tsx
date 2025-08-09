import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  // If no publishable key, render children without Clerk
  if (!clerkPubKey || clerkPubKey.trim() === '') {
    console.warn('Clerk publishable key not found. Authentication features will be disabled.');
    return <>{children}</>;
  }

  // Validate key format
  if (!clerkPubKey.startsWith('pk_')) {
    console.warn('Invalid Clerk publishable key format. Authentication features will be disabled.');
    return <>{children}</>;
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        variables: {
          colorPrimary: '#3b82f6',
        }
      }}
    >
      <ClerkLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        {children}
      </ClerkLoaded>
    </ClerkProvider>
  );
}