import React, { useState, useEffect } from "react";
import { apiClient as base44 } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Film, Tv, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function MyList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: allContent = [] } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.Content.findMany(),
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      base44.auth.redirectToLogin(createPageUrl("MyList"));
    }
  };

  const handleRemoveFavorite = async (contentId) => {
    if (!user) return;
    
    const favorites = user.favorite_content || [];
    const newFavorites = favorites.filter(id => id !== contentId);
    
    await base44.auth.updateMe({ favorite_content: newFavorites });
    await loadUser();
  };

  const handleWatch = (contentId) => {
    navigate(createPageUrl(`Watch?id=${contentId}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  const favoriteIds = user?.favorite_content || [];
  const favoriteContent = allContent.filter(c => favoriteIds.includes(c.id));
  
  const stats = {
    total: favoriteContent.length,
    movies: favoriteContent.filter(c => c.type === "movie").length,
    tvShows: favoriteContent.filter(c => c.type === "tv_show").length,
  };

  return (
    <div className="min-h-screen oldflick-gradient py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-[var(--oldflick-gold)]" />
              My List
            </h1>
            <p className="text-gray-400">
              Your personal collection of favorite classic content
            </p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("Browse"))}
            variant="outline"
            className="border-[var(--oldflick-gold)] text-[var(--oldflick-gold)] hover:bg-[var(--oldflick-gold)]/10"
          >
            Browse More Content
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-[var(--oldflick-gold)]" />
                Total Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-500" />
                Movies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.movies}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-purple-500" />
                TV Shows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.tvShows}</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Table */}
        {favoriteContent.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-20 text-center">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Your list is empty</p>
              <p className="text-gray-500 text-sm mb-6">
                Start adding your favorite classic films and TV shows
              </p>
              <Button
                onClick={() => navigate(createPageUrl("Browse"))}
                className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
              >
                Browse Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Genre
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {favoriteContent.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100"}
                              alt={item.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium text-white">{item.title}</div>
                              {item.director && (
                                <div className="text-sm text-gray-400">Dir: {item.director}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {item.type === "movie" ? (
                              <Film className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Tv className="w-4 h-4 text-purple-500" />
                            )}
                            <span className="text-white capitalize">{item.type?.replace("_", " ")}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white">{item.release_year}</td>
                        <td className="px-6 py-4">
                          {item.rating ? (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-white">{item.rating}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.genre && item.genre.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.genre.slice(0, 2).map(g => (
                                <span
                                  key={g}
                                  className="px-2 py-0.5 bg-[var(--oldflick-burgundy)]/30 text-white text-xs rounded"
                                >
                                  {g}
                                </span>
                              ))}
                              {item.genre.length > 2 && (
                                <span className="text-gray-500 text-xs">+{item.genre.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleWatch(item.id)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                              title="Watch"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveFavorite(item.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              title="Remove from list"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}