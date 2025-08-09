import { createClerkClient } from '@clerk/clerk-sdk-node';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY environment variable is required');
}

const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });

export async function verifyClerkToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = await clerkClient.verifyToken(token);
    return payload.sub; // This is the user ID
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getClerkUser(userId: string) {
  try {
    return await clerkClient.users.getUser(userId);
  } catch (error) {
    console.error('Failed to get Clerk user:', error);
    return null;
  }
}