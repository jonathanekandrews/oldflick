
import React, { useState, useEffect } from "react";
import { apiClient as base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Film, Star, Calendar, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentRow from "../components/browse/ContentRow";

const GENRE_ORDER = [
  "Masterpieces",
  "Cult",
  "Film Noir",
  "Drama",
  "Comedy",
  "Western",
  "Romance",
  "Mystery",
  "Thriller",
  "Adventure",
  "Action",
  "Crime",
  "War",
  "Horror",
  "Science Fiction",
  "Musical"
];

export default function ClassicFilms() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.content.list(),
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

  const films = allContent.filter(c => c.content_type === "film");
  
  const groupByGenre = () => {
    const grouped = {};
    
    GENRE_ORDER.forEach(genre => {
      if (genre === "Masterpieces") {
        grouped[genre] = films.filter(m => m.is_masterpiece);
      } else if (genre === "Cult") {
        grouped[genre] = films.filter(m => m.is_cult);
      } else {
        grouped[genre] = films.filter(m =>
          m.genre && m.genre.includes(genre)
        );
      }
    });
    
    return grouped;
  };

  const genreGroups = groupByGenre();
  
  const stats = {
    total: films.length,
    topRated: films.filter(m => m.rating >= 8).length,
    decades: new Set(films.map(m => Math.floor(m.release_year / 10) * 10)).size,
    directors: new Set(films.map(m => m.director).filter(Boolean)).size,
  };

  const featuredFilm = films.find(m => m.is_featured) || films[0];

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
      {featuredFilm && (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredFilm.poster_url}
              alt={featuredFilm.title}
              className="w-full h-full object-cover bg-gradient-to-br from-gray-900 to-black"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--oldflick-burgundy)]/80 backdrop-blur-sm rounded-full mb-4">
                <Film className="w-4 h-4 text-[var(--oldflick-gold)]" />
                <span className="text-[var(--oldflick-gold)] text-sm font-semibold uppercase tracking-wider">
                  Classic Films
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl">
                Cinema's Golden Age
              </h1>
              
              <p className="text-xl text-gray-200 mb-6">
                Explore timeless masterpieces from Hollywood's most legendary era. 
                From noir mysteries to epic westerns, discover films that defined cinema.
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
                <Film className="w-4 h-4 text-[var(--oldflick-gold)]" />
                Total Films
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
                <Users className="w-4 h-4 text-purple-500" />
                Directors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.directors}</p>
              <p className="text-xs text-gray-400 mt-1">legends</p>
            </CardContent>
          </Card>
        </div>

        {/* Genre Sections */}
        <div className="space-y-10">
          {GENRE_ORDER.map(genre => {
            const content = genreGroups[genre];
            if (!content || content.length === 0) return null;

            const displayName = genre === "Masterpieces" ? "Masterpieces" : 
                               genre === "Cult" ? "Cult Classics" : 
                               genre;

            const getGenreDescription = () => {
              switch(genre) {
                case "Masterpieces":
                  return "Cinema's finest achievements and most celebrated classics";
                case "Cult":
                  return "Unconventional films that earned devoted followings";
                case "Film Noir":
                  return "Dark, stylish crime dramas that defined an era of cinema";
                case "Western":
                  return "Epic tales from the American frontier";
                case "Drama":
                  return "Powerful stories of human emotion and conflict";
                case "Comedy":
                  return "Timeless humor from Hollywood's golden age";
                case "Romance":
                  return "Classic love stories that touched hearts";
                case "Mystery":
                  return "Intriguing whodunits and detective stories";
                case "Thriller":
                  return "Suspenseful tales that keep you on edge";
                case "Horror":
                  return "Classic chills from cinema's most frightening era";
                case "Science Fiction":
                  return "Visionary tales of the future and beyond";
                case "Musical":
                  return "Song and dance spectacles from the golden age";
                case "Action":
                  return "Explosive thrills and heroic adventures from cinema's early days";
                case "Crime":
                  return "Gritty narratives of lawbreakers and justice seekers";
                case "War":
                  return "Dramatic portrayals of conflict and courage";
                case "Adventure":
                  return "Thrilling journeys and heroic quests across exotic lands";
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
                      ({content.length} {content.length === 1 ? 'film' : 'films'})
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

        {/* Empty State */}
        {films.length === 0 && (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No classic films available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
