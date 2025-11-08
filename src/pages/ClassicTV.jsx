
import React, { useState, useEffect } from "react";
import { apiClient as base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tv, Star, Calendar, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentRow from "../components/browse/ContentRow";

// More comprehensive genre order for TV shows
const GENRE_ORDER = [
  "Cult",
  "Comedy",
  "Drama",
  "Western",
  "Mystery",
  "Adventure",
  "Action",
  "Science Fiction",
  "Crime",
  "Thriller",
  "Romance",
  "Horror",
  "War",
  "Musical"
];

export default function ClassicTV() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.Content.list('-created_date'),
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log("User not logged in");
    }
  };

  const tvShows = allContent.filter(c => c.type === "tv_show");
  
  const groupByGenre = () => {
    const grouped = {};
    
    GENRE_ORDER.forEach(genre => {
      if (genre === "Cult") {
        grouped[genre] = tvShows.filter(tv => tv.is_cult);
      } else {
        grouped[genre] = tvShows.filter(tv => 
          tv.genre && tv.genre.includes(genre)
        );
      }
    });
    
    return grouped;
  };

  const genreGroups = groupByGenre();
  
  const stats = {
    total: tvShows.length,
    topRated: tvShows.filter(tv => tv.imdb_rating >= 8).length,
    decades: new Set(tvShows.map(tv => Math.floor(tv.year / 10) * 10)).size,
    unique: genreGroups
  };

  const featuredShow = tvShows.find(tv => tv.is_featured) || tvShows[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oldflick-gradient">
      {/* Hero Section */}
      {featuredShow && (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredShow.backdrop_url || featuredShow.thumbnail_url || "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1920"}
              alt={featuredShow.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--oldflick-burgundy)]/80 backdrop-blur-sm rounded-full mb-4">
                <Tv className="w-4 h-4 text-[var(--oldflick-gold)]" />
                <span className="text-[var(--oldflick-gold)] text-sm font-semibold uppercase tracking-wider">
                  Classic TV
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl">
                Television's Greatest Hits
              </h1>
              
              <p className="text-xl text-gray-200 mb-6">
                Journey back to the golden era of television. From beloved sitcoms to 
                groundbreaking dramas, experience the shows that captivated generations.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Tv className="w-4 h-4 text-[var(--oldflick-gold)]" />
                Total Shows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                Top Rated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.topRated}</p>
              <p className="text-xs text-gray-400 mt-1">8+ rating</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-500" />
                Decades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.decades}</p>
              <p className="text-xs text-gray-400 mt-1">eras covered</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{GENRE_ORDER.filter(g => genreGroups[g]?.length > 0).length}</p>
              <p className="text-xs text-gray-400 mt-1">categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Genre Sections */}
        <div className="space-y-10">
          {GENRE_ORDER.map(genre => {
            const content = genreGroups[genre];
            if (!content || content.length === 0) return null;

            const displayName = genre === "Cult" ? "Cult Classics" : genre;

            const getGenreDescription = () => {
              switch(genre) {
                case "Cult":
                  return "Unconventional TV shows that earned devoted followings";
                case "Comedy":
                  return "Classic sitcoms that brought laughter to millions";
                case "Drama":
                  return "Compelling stories of human drama and emotion";
                case "Western":
                  return "Frontier adventures from TV's golden age";
                case "Mystery":
                  return "Suspenseful whodunits and detective stories";
                case "Adventure":
                  return "Thrilling journeys and exciting escapades";
                case "Science Fiction":
                  return "Groundbreaking sci-fi that imagined the future";
                case "Crime":
                  return "Gripping tales of law enforcement and justice";
                case "Action":
                  return "High-energy action and excitement";
                case "Thriller":
                  return "Edge-of-your-seat suspense and tension";
                case "Romance":
                  return "Heartwarming love stories on the small screen";
                case "Horror":
                  return "Chilling tales that haunted living rooms";
                case "War":
                  return "Stories of conflict, heroism, and the human spirit during wartime";
                case "Musical":
                  return "Television bringing song, dance, and spectacle to your screen";
                default:
                  return null;
              }
            };

            const description = getGenreDescription();

            return (
              <div key={genre}>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    {displayName}
                    <span className="text-sm font-normal text-gray-400">
                      ({content.length} {content.length === 1 ? 'show' : 'shows'})
                    </span>
                  </h2>
                  {description && (
                    <p className="text-gray-400 text-sm">{description}</p>
                  )}
                </div>
                <ContentRow
                  title=""
                  content={content}
                  user={user}
                />
              </div>
            );
          })}
        </div>

        {/* Special Sections */}
        {tvShows.length > 0 && (
          <div className="mt-16 space-y-10">
            {/* Anthology Series */}
            {tvShows.filter(tv => tv.themes?.includes("Anthology") || tv.title.toLowerCase().includes("twilight zone") || tv.title.toLowerCase().includes("alfred hitchcock")).length > 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Anthology Series
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Self-contained episodes, each a unique story
                  </p>
                </div>
                <ContentRow
                  title=""
                  content={tvShows.filter(tv => tv.themes?.includes("Anthology") || tv.title.toLowerCase().includes("twilight zone") || tv.title.toLowerCase().includes("alfred hitchcock"))}
                  user={user}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {tvShows.length === 0 && (
          <div className="text-center py-20">
            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No classic TV shows available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
