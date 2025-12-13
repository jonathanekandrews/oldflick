
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiClient as base44 } from "@/api/client";
import { Play, Info, Plus, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection({ content, user, hasActiveSubscription }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(
    user?.favorite_content?.includes(content.id) || false
  );

  const toggleFavorite = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const favorites = user.favorite_content || [];
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== content.id)
      : [...favorites, content.id];

    await base44.auth.updateMe({ favorite_content: newFavorites });
    setIsFavorite(!isFavorite);
  };

  const handlePlay = () => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl(`Watch?id=${content.id}`));
      return;
    }
    
    if (!hasActiveSubscription) {
      navigate(createPageUrl("Pricing"));
      return;
    }
    
    navigate(createPageUrl(`Watch?id=${content.id}`));
  };

  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={content.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920"}
          alt={content.title || "Content backdrop"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl">
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl text-white">
            {content.title || "Classic Content"}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-6 text-white">
            {content.release_year && (
              <span className="text-[var(--oldflick-gold)] font-semibold">{content.release_year}</span>
            )}
            {content.content_type && (
              <span className="px-2 py-1 border border-gray-400 rounded text-sm text-white">
                {content.content_type === 'tv' ? 'TV' : 'Film'}
              </span>
            )}
            {content.runtime_minutes && <span className="text-gray-300">{content.runtime_minutes} min</span>}
            {content.rating && (
              <span className="flex items-center gap-1 text-white">
                <span className="text-yellow-500">★</span>
                <span>{content.rating}/10</span>
              </span>
            )}
          </div>

          {/* Description */}
          {content.description && (
            <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3">
              {content.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90 text-white font-semibold uppercase"
              onClick={handlePlay}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              {hasActiveSubscription ? "Watch Now" : "Subscribe to Watch"}
            </Button>

            {!hasActiveSubscription && user && (
              <Button
                size="lg"
                className="bg-[var(--oldflick-gold)] hover:bg-[var(--oldflick-gold)]/90 text-black font-semibold uppercase"
                onClick={() => navigate(createPageUrl("Pricing"))}
              >
                <Crown className="w-5 h-5 mr-2" />
                {user.free_trial_used ? "Subscribe" : "Try Free 24h"}
              </Button>
            )}

            {user && (
              <Button
                size="lg"
                variant="outline"
                className={`border-white font-semibold uppercase backdrop-blur-sm ${
                  isFavorite 
                    ? "bg-[var(--oldflick-gold)]/20 text-[var(--oldflick-gold)] border-[var(--oldflick-gold)] hover:bg-[var(--oldflick-gold)]/30" 
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                onClick={toggleFavorite}
              >
                {isFavorite ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    My List
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add to List
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
