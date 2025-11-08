
import React, { useState, useEffect } from "react";
import { apiClient as base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContentCard from "../components/search/ContentCard";

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
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

  const getAllGenres = () => {
    const genres = new Set();
    allContent.forEach(content => {
      if (content.genre && Array.isArray(content.genre)) {
        content.genre.forEach(g => genres.add(g));
      }
    });
    return Array.from(genres).sort();
  };

  const getYearRanges = () => {
    return ["1900s", "1910s", "1920s", "1930s", "1940s", "1950s", "1960s"];
  };

  const filteredContent = allContent.filter(content => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = content.title?.toLowerCase()?.includes(query) || false;
      const matchesDescription = content.description?.toLowerCase()?.includes(query) || false;
      const matchesCast = content.cast?.some(c => c?.toLowerCase()?.includes(query)) || false;
      const matchesDirector = content.director?.toLowerCase()?.includes(query) || false;
      
      if (!matchesTitle && !matchesDescription && !matchesCast && !matchesDirector) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== "all" && content.type !== typeFilter) {
      return false;
    }

    // Genre filter
    if (genreFilter !== "all") {
      if (!content.genre || !content.genre.includes(genreFilter)) {
        return false;
      }
    }

    // Year filter
    if (yearFilter !== "all" && content.year) {
      const decade = Math.floor(content.year / 10) * 10;
      const decadeStr = `${decade}s`;
      if (decadeStr !== yearFilter) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setGenreFilter("all");
    setYearFilter("all");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "all" || genreFilter !== "all" || yearFilter !== "all";

  return (
    <div className="min-h-screen oldflick-gradient py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Search Classic Content
          </h1>
          <p className="text-gray-400">
            Discover timeless movies and TV shows from cinema's golden age
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, actor, director..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg focus:bg-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Filters
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[var(--oldflick-burgundy)] hover:text-[var(--oldflick-gold)] ml-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv_show">TV Shows</SelectItem>
              </SelectContent>
            </Select>

            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {getAllGenres().map(genre => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Era" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Eras</SelectItem>
                {getYearRanges().map(decade => (
                  <SelectItem key={decade} value={decade}>
                    {decade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-400">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                {filteredContent.length} {filteredContent.length === 1 ? "result" : "results"} found
              </>
            )}
          </p>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No content found matching your search.</p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredContent.map(content => (
              <ContentCard
                key={content.id}
                content={content}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
