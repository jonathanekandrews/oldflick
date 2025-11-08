import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiClient as base44 } from "@/api/client";
import { Play, Info, Heart, MoreHorizontal, Share2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActionBar({ content, user }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(
    user?.favorite_content?.includes(content?.id) || false
  );

  if (!content) return null;

  const handleWatchNow = () => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl(`Watch?id=${content.id}`));
      return;
    }
    navigate(createPageUrl(`Watch?id=${content.id}`));
  };

  const handleViewInfo = () => {
    navigate(createPageUrl(`Watch?id=${content.id}`));
  };

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

  const handleShare = async () => {
    const url = `${window.location.origin}${createPageUrl(`Watch?id=${content.id}`)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="relative z-20 -mt-16 mb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border border-white/10 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90 text-white font-semibold px-8"
              onClick={handleWatchNow}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              WATCH NOW
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={handleViewInfo}
            >
              <Info className="w-5 h-5 mr-2" />
              VIEW INFO
            </Button>

            <Button
              size="lg"
              variant="outline"
              className={`border-white/30 hover:bg-white/10 ${
                isFavorite ? "bg-[var(--oldflick-burgundy)]/20 text-[var(--oldflick-gold)]" : "text-white"
              }`}
              onClick={toggleFavorite}
            >
              <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
              FAVORITES
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 border-white/10">
                <DropdownMenuItem 
                  onClick={handleShare}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate(createPageUrl("Account"))}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}