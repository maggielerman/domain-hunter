import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/simple-auth';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AuthDialog } from '@/components/auth/auth-dialog';

interface FavoriteButtonProps {
  domainId: number;
  domainName: string;
  className?: string;
}

export function FavoriteButton({ domainId, domainName, className }: FavoriteButtonProps) {
  const { user, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  
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