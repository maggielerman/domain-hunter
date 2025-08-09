import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#3b82f6',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}