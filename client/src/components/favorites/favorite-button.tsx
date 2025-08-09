import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';


interface FavoriteButtonProps {
  domainId: number;
  domainName: string;
  className?: string;
}

export function FavoriteButton({ domainId, domainName, className }: FavoriteButtonProps) {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const queryClient = useQueryClient();

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

  const isSignedIn = !!user;
  
  // Check if domain is favorited
  const { data: favoriteData } = useQuery({
    queryKey: ['/api/favorites/check', domainId],
    enabled: isSignedIn,
  });
  
  const isFavorited = (favoriteData as { isFavorited: boolean })?.isFavorited || false;

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/favorites', { domainId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/check', domainId] });
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/favorites/${domainId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/check', domainId] });
    },
  });

  const handleToggleFavorite = async () => {
    if (!isSignedIn) {
      // Could trigger sign-in modal here
      return;
    }

    if (isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  if (!isSignedIn) {
    return null; // Hide favorite button for non-authenticated users
  }

  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 transition-colors",
        isFavorited ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500",
        className
      )}
    >
      <Heart 
        className={cn(
          "w-4 h-4 transition-all",
          isFavorited ? "fill-current" : ""
        )} 
      />
      {isFavorited ? "Favorited" : "Add to Favorites"}
    </Button>
  );
}