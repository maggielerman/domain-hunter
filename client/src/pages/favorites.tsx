import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopNav from '@/components/navigation/top-nav';

interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

export default function Favorites() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | undefined>();

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

  // Get user's domain lists
  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['/api/lists'],
    enabled: isSignedIn,
  });

  // Get user's favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites', selectedListId],
    enabled: isSignedIn,
  });

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign in to view favorites</h2>
          <p className="text-slate-600 mb-6">
            Create an account to save your favorite domains and organize them into lists.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav showBackButton={true} />

      {/* Page Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-bold text-slate-900">My Favorites</h1>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {listsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading your lists...</p>
          </div>
        ) : (
          <Tabs value={selectedListId?.toString() || 'all'} onValueChange={(value) => 
            setSelectedListId(value === 'all' ? undefined : parseInt(value))
          }>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Favorites ({favorites.length})</TabsTrigger>
              {lists.map((list: any) => (
                <TabsTrigger key={list.id} value={list.id.toString()}>
                  {list.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedListId?.toString() || 'all'}>
              {favoritesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                  <p className="text-slate-600 mt-4">Loading favorites...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorites yet</h3>
                  <p className="text-slate-600 mb-6">
                    Start favoriting domains to see them here. They'll be organized in your lists for easy access.
                  </p>
                  <Link href="/">
                    <Button>Start Searching</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite: any) => (
                    <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-slate-900">
                            {favorite.domain.name}
                          </CardTitle>
                          <Badge variant={favorite.domain.isAvailable ? "default" : "secondary"}>
                            {favorite.domain.isAvailable ? "Available" : "Taken"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Price</span>
                            <span className="font-semibold text-brand-600">
                              ${favorite.domain.price}/year
                            </span>
                          </div>
                          
                          {favorite.domain.description && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {favorite.domain.description}
                            </p>
                          )}
                          
                          {favorite.notes && (
                            <div className="bg-slate-50 p-2 rounded">
                              <p className="text-sm text-slate-700">
                                <strong>Notes:</strong> {favorite.notes}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-500">
                              Added {new Date(favorite.createdAt).toLocaleDateString()}
                            </span>
                            {favorite.domain.isAvailable && (
                              <Button size="sm" variant="outline">
                                Buy Domain
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}