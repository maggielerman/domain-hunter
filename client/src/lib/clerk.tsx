import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  // If no publishable key, render children without Clerk (authentication disabled)
  if (!clerkPubKey) {
    console.warn('Clerk publishable key not found. Authentication features will be disabled.');
    return <>{children}</>;
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        variables: {
          colorPrimary: '#3b82f6',
          colorText: '#334155',
          colorTextSecondary: '#64748b',
        },
        elements: {
          formButtonPrimary: 
            'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'border border-slate-200 shadow-lg',
          headerTitle: 'text-slate-900',
          headerSubtitle: 'text-slate-600',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}