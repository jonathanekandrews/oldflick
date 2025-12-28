
import React, { useState, useEffect, useRef } from "react";
import { apiClient as base44 } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Watch() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [content, setContent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(true);
  const [adCountdown, setAdCountdown] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCodecWarning, setShowCodecWarning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showAd && adCountdown === 0) {
      setShowAd(false);
      // Auto-play and fullscreen after countdown ends
      handleAutoPlayAndFullscreen();
    }
  }, [showAd, adCountdown]);

  const loadData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const contentId = urlParams.get('id');

      if (!contentId) {
        navigate(createPageUrl("Browse"));
        return;
      }

      let currentUser = null;
      try {
        currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log("Anonymous user or failed to fetch user");
      }

      const foundContent = await base44.entities.content.findById(contentId);
      
      if (!foundContent) {
        navigate(createPageUrl("Browse"));
        return;
      }

      setContent(foundContent);
      
      if (currentUser) {
        setIsFavorite(currentUser.favorite_content?.includes(contentId) || false);

        // Safe watch history update with null checks
        const watchHistory = currentUser.watch_history || [];
        const updatedHistory = [
          ...watchHistory.filter(h => h?.content_id !== contentId),
          {
            content_id: contentId,
            watched_at: new Date().toISOString(),
            progress: 0
          }
        ];
        
        // Only update if history is enabled
        if (currentUser.history_enabled !== false) {
          await base44.auth.updateMe({ watch_history: updatedHistory });
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading content:", error);
      // Don't redirect to login, just show sign up modal after 30 min (handled by checkWatchPermission)
      // This catch is for general errors during data loading (e.g., content fetch failed).
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error("Playback failed:", err);
          setShowCodecWarning(true);
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      return;
    }
    const favorites = user.favorite_content || [];
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== content.id)
      : [...favorites, content.id];

    await base44.auth.updateMe({ favorite_content: newFavorites });
    setIsFavorite(!isFavorite);
  };

  const handleAutoPlayAndFullscreen = () => {
    // Small delay to ensure video element is rendered and DOM updated
    setTimeout(() => {
      if (videoRef.current) {
        // Request fullscreen first
        videoRef.current.requestFullscreen().catch(err => {
          console.log("Fullscreen request failed (may be restricted):", err.message);
          // Continue with autoplay even if fullscreen fails
        });

        // Auto-play the video
        videoRef.current.play().catch(err => {
          console.log("Auto-play blocked by browser:", err.message);
          // Browser may restrict autoplay - graceful fallback to manual play
        });
      }
    }, 100);
  };

  const handleSkipCountdown = () => {
    setShowAd(false);
    setAdCountdown(0);
    // Trigger auto-play and fullscreen immediately
    handleAutoPlayAndFullscreen();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  // Check if video URL is available
  const hasVideo = content && content.video_url;

  return (
    <div className="min-h-screen bg-black">
      {/* Codec Warning Modal */}
      <Dialog open={showCodecWarning} onOpenChange={setShowCodecWarning}>
        <DialogContent className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-500 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <AlertCircle className="w-7 h-7" />
              Video Playback Issue
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-white/95 text-base leading-relaxed pt-2">
            Unable to play this video. This may be due to browser compatibility or network issues.
          </DialogDescription>
          <div className="space-y-2 text-white/90 text-sm mt-4">
            <p className="font-semibold mb-2">Try these solutions:</p>
            <p>• Use <strong>Chrome</strong>, <strong>Safari</strong>, or <strong>Edge</strong> browser</p>
            <p>• Update your browser to the latest version</p>
            <p>• Check your internet connection</p>
            <p>• Disable browser extensions that might block video</p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setShowCodecWarning(false)}
              className="bg-white text-yellow-700 hover:bg-white/90 font-semibold"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative w-full aspect-video bg-black">
        {!hasVideo ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="text-center max-w-md px-4">
              <div className="mb-6">
                <img
                  src={content.poster_url}
                  alt={content.title}
                  className="w-32 h-48 mx-auto object-cover rounded-lg shadow-2xl opacity-70"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
              <p className="text-gray-300 mb-6">
                This content is not yet available for streaming. Please check back later.
              </p>
              <Button
                className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold"
                onClick={() => navigate(createPageUrl("Browse"))}
              >
                Back to Browse
              </Button>
            </div>
          </div>
        ) : showAd ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black cursor-pointer hover:bg-black/80 transition-colors"
            onClick={handleSkipCountdown}
          >
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-block p-8 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <div className="text-6xl font-bold text-[var(--oldflick-gold)]">
                    {adCountdown}
                  </div>
                </div>
              </div>
              <p className="text-xl text-gray-400">
                Your video will begin in <span className="text-white font-semibold">{adCountdown}</span> seconds
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Click anywhere to start now
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full bg-black"
              src={content.video_url}
              poster={content.poster_url}
              controls
              controlsList="nodownload"
              preload="metadata"
              playsInline
              onPlay={() => {
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error("Video playback error:", e);
                console.error("Video error details:", {
                  error: e.target.error,
                  networkState: e.target.networkState,
                  readyState: e.target.readyState,
                  src: e.target.src
                });
                setShowCodecWarning(true);
              }}
              onLoadedMetadata={() => {
                console.log("✅ Video metadata loaded successfully");
              }}
              onLoadStart={() => {
                console.log("🔄 Video loading started...");
              }}
              onCanPlay={() => {
                console.log("✅ Video can play - ready to start");
              }}
            >
              <source src={content.video_url} type="video/mp4" />
              Your browser does not support video playback. Please try Chrome, Safari, or Edge browsers.
            </video>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => navigate(createPageUrl("Browse"))}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {content.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              {content.release_year && <span>{content.release_year}</span>}
              {content.content_type && (
                <span className="px-2 py-0.5 border border-gray-600 rounded text-sm">
                  {content.content_type === 'tv' ? 'TV' : 'Film'}
                </span>
              )}
              {content.runtime_minutes && <span>{content.runtime_minutes} min</span>}
              {content.rating && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-white">{content.rating}/10</span>
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={toggleFavorite}
            disabled={!user}
            title={user ? "Add to favorites" : "Sign in to save favorites"}
          >
            {isFavorite ? (
              <Check className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-gray-300 text-lg mb-6">
              {content.description}
            </p>

            {content.genre && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">GENRE</h3>
                <div className="flex flex-wrap gap-2">
                  {(typeof content.genre === 'string' ? [content.genre] : Array.isArray(content.genre) ? content.genre : []).map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {content.actors && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">CAST</h3>
                <p className="text-gray-300 text-sm">
                  {typeof content.actors === 'string' ? content.actors : Array.isArray(content.actors) ? content.actors.join(", ") : ""}
                </p>
              </div>
            )}

            {content.director && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">DIRECTOR</h3>
                <p className="text-gray-300 text-sm">{content.director}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
