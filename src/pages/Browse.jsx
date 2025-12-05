
import React, { useState, useEffect, useRef } from "react";
import { apiClient as base44 } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ContentRow from "../components/browse/ContentRow";
import HeroSection from "../components/browse/HeroSection";
import SubscriptionPrompt from "../components/browse/SubscriptionPrompt";
import { Button } from "@/components/ui/button";
import AnonymousTimer from "../components/browse/AnonymousTimer";
import SignUpModal from "../components/browse/SignUpModal";

export default function Browse({ layoutActiveFilter, layoutSelectedGenres }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [featuredContent, setFeaturedContent] = useState(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const filteredContentRef = useRef(null);

  // Use filter state from layout
  const activeFilter = layoutActiveFilter || "all";
  const selectedGenres = layoutSelectedGenres || [];

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.Content.findMany(),
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (allContent && allContent.length > 0) {
      const validContent = allContent.filter(c => c != null);
      const featured = validContent.find(c => c.is_featured === true) || validContent[0];
      if (featured) {
        setFeaturedContent(featured);
      }
    }
  }, [allContent]);

  // CRITICAL FIX #1: Scroll based on filter state changes (handles on-page filtering)
  useEffect(() => {
    if (activeFilter !== "all" || selectedGenres.length > 0) {
      // Delay to ensure content is rendered
      setTimeout(() => {
        if (filteredContentRef.current) {
          filteredContentRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 150);
    } else {
      // CRITICAL FIX #3: Scroll to top when clearing filters
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeFilter, selectedGenres]);

  // ADDITIONAL: Also scroll on URL change (handles cross-page navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const filterParam = urlParams.get('filter');
    const genreParam = urlParams.get('genre');
    
    if (filterParam || genreParam) {
      setTimeout(() => {
        if (filteredContentRef.current) {
          filteredContentRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 300);
    }
  }, [location.search]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log("Anonymous user - will show timer");
      // Don't redirect, allow anonymous browsing
    }
  };

  const handleTimeExpired = () => {
    setShowSignUpModal(true);
  };

  const hasActiveSubscription = () => {
    if (!user) return false;
    return user.subscription_status === "free_trial" || user.subscription_status === "active";
  };

  const getFilteredContent = () => {
    if (!allContent || !Array.isArray(allContent)) return [];
    
    let filtered = allContent.filter(c => c != null);

    // Apply filter bar filters
    switch (activeFilter) {
      case "classic_films":
        filtered = filtered.filter(c => c && c.type === "movie");
        break;
      case "classic_tv":
        filtered = filtered.filter(c => c && c.type === "tv_show");
        break;
      case "my_list":
        if (user && user.favorite_content && Array.isArray(user.favorite_content)) {
          filtered = filtered.filter(c => c && c.id && user.favorite_content.includes(c.id));
        } else {
          filtered = [];
        }
        break;
    }

    // Apply genre filter
    if (selectedGenres && selectedGenres.length > 0) {
      filtered = filtered.filter(c => {
        if (!c || !c.genre || !Array.isArray(c.genre)) return false;
        return c.genre.some(g => g && selectedGenres.includes(g));
      });
    }

    return filtered;
  };

  const groupContentByGenre = (content) => {
    if (!content || !Array.isArray(content)) return {};
    
    const genres = {};
    content.forEach(item => {
      if (!item || !item.genre || !Array.isArray(item.genre)) return;
      
      item.genre.forEach(genre => {
        if (genre && typeof genre === 'string') {
          if (!genres[genre]) genres[genre] = [];
          genres[genre].push(item);
        }
      });
    });
    return genres;
  };

  const filteredContent = getFilteredContent();
  const contentByType = {
    movies: filteredContent.filter(c => c && c.type === "movie"),
    tvShows: filteredContent.filter(c => c && c.type === "tv_show"),
  };
  const genreGroups = groupContentByGenre(filteredContent);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oldflick-gradient">
      {/* Anonymous Timer - shows countdown for non-logged-in users */}
      <AnonymousTimer user={user} onTimeExpired={handleTimeExpired} />

      {/* Sign Up Modal */}
      <SignUpModal 
        isOpen={showSignUpModal} 
        onClose={() => setShowSignUpModal(false)} 
      />

      {/* Hero Section - Only show when no filters active */}
      {featuredContent && activeFilter === "all" && selectedGenres.length === 0 && (
        <HeroSection 
          content={featuredContent} 
          user={user}
          hasActiveSubscription={hasActiveSubscription()}
        />
      )}

      {/* Filter Indicator - with scroll target */}
      {(activeFilter !== "all" || selectedGenres.length > 0) && (
        <div ref={filteredContentRef} className="pt-8 px-4 sm:px-6 lg:px-8 scroll-mt-48">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {activeFilter === "classic_films" ? "CLASSIC MOVIES" :
               activeFilter === "classic_tv" ? "CLASSIC TV SHOWS" :
               activeFilter === "my_list" ? "MY LIST" :
               selectedGenres.length > 0 ? selectedGenres.join(", ").toUpperCase() : 
               "BROWSE"}
            </h2>
            <p className="text-gray-400">
              {filteredContent.length} {filteredContent.length === 1 ? "title" : "titles"} available
            </p>
          </div>
        </div>
      )}

      {/* Subscription Prompt - only for logged in users without subscription */}
      {user && !hasActiveSubscription() && (
        <SubscriptionPrompt user={user} />
      )}

      {/* Content Rows */}
      <div className="pb-20 space-y-8">
        {activeFilter === "all" && selectedGenres.length === 0 && contentByType.movies.length > 0 && (
          <ContentRow title="CLASSIC MOVIES" content={contentByType.movies} user={user} />
        )}

        {activeFilter === "all" && selectedGenres.length === 0 && contentByType.tvShows.length > 0 && (
          <ContentRow title="VINTAGE TV SHOWS" content={contentByType.tvShows} user={user} />
        )}

        {(activeFilter !== "all" || selectedGenres.length > 0) && filteredContent.length > 0 && (
          <ContentRow 
            title={
              activeFilter === "classic_films" ? "CLASSIC FILMS" :
              activeFilter === "classic_tv" ? "CLASSIC TV SHOWS" :
              activeFilter === "my_list" ? "MY LIST" :
              selectedGenres.length > 0 ? selectedGenres.join(", ").toUpperCase() :
              "CONTENT"
            }
            content={filteredContent}
            user={user}
          />
        )}

        {activeFilter === "all" && selectedGenres.length === 0 && Object.entries(genreGroups).slice(0, 5).map(([genre, items]) => (
          items.length > 0 && (
            <ContentRow key={genre} title={genre.toUpperCase()} content={items} user={user} />
          )
        ))}

        {filteredContent.length === 0 && (
          <div className="text-center py-20 px-4">
            <p className="text-gray-400 text-lg mb-4">
              {activeFilter === "my_list" 
                ? "Your list is empty. Add content to your favorites to see them here."
                : (activeFilter !== "all" || selectedGenres.length > 0)
                ? "No content available for this filter yet."
                : "No content available yet."
              }
            </p>
            {user?.role === "admin" && activeFilter !== "my_list" && (
              <Button
                onClick={() => navigate(createPageUrl("Admin"))}
                className="mt-4 bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
              >
                Add Content
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
