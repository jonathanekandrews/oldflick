
import React, { useState, useEffect, useRef } from "react";
import { apiClient as base44 } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Plus, Check, AlertCircle, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { hasTimeExpired } from "../components/browse/AnonymousTimer";
import SignUpModal from "../components/browse/SignUpModal";

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
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [canWatch, setCanWatch] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showAd && adCountdown === 0) {
      setShowAd(false);
      // Check if anonymous user has time left
      checkWatchPermission();
    }
  }, [showAd, adCountdown]);

  const checkWatchPermission = () => {
    // If user is logged in and has subscription, allow
    if (user && (user.subscription_status === "free_trial" || user.subscription_status === "active")) {
      setCanWatch(true);
      return;
    }

    // If user is not logged in, check anonymous timer
    if (!user) { // This condition implicitly means the user is anonymous or base44.auth.me() failed
      const timeExpired = hasTimeExpired();
      if (timeExpired) {
        setCanWatch(false);
        setShowSignUpModal(true);
        // Pause video if playing
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      } else {
        setCanWatch(true);
      }
    }
  };

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
        console.log("Anonymous user or failed to fetch user - checking timer");
        // If base44.auth.me() fails, it's likely an anonymous user or token issue.
        // We explicitly check the timer for anonymous users.
        if (hasTimeExpired()) {
          setShowSignUpModal(true);
          setCanWatch(false);
        }
      }

      // If user is logged in but no subscription, redirect to account
      if (currentUser && currentUser.subscription_status !== "free_trial" && 
          currentUser.subscription_status !== "active") {
        navigate(createPageUrl("Account"));
        return;
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
    }
  };

  const togglePlay = () => {
    if (!canWatch) {
      setShowSignUpModal(true);
      return;
    }

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
        setShowSignUpModal(true);
        return;
    }
    const favorites = user.favorite_content || [];
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== content.id)
      : [...favorites, content.id];

    await base44.auth.updateMe({ favorite_content: newFavorites });
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sign Up Modal */}
      <SignUpModal 
        isOpen={showSignUpModal} 
        onClose={() => {
          setShowSignUpModal(false);
          // If the user closes the sign-up modal after time expiry, navigate them away
          if (!canWatch) {
            navigate(createPageUrl("Browse"));
          }
        }} 
      />

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
        {showAd ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
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
                Buffering content... Please wait
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
              controls={canWatch}
              controlsList="nodownload"
              preload="metadata"
              playsInline
              onPlay={() => {
                // When video tries to play, re-check permissions
                checkWatchPermission();
                if (canWatch) {
                  setIsPlaying(true);
                } else {
                  // If checkWatchPermission found user can't watch, pause the video
                  if (videoRef.current) {
                    videoRef.current.pause();
                  }
                  setShowSignUpModal(true); // Ensure modal is shown
                }
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

            {/* Overlay if can't watch */}
            {!canWatch && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Crown className="w-20 h-20 text-[var(--oldflick-gold)] mx-auto mb-6 animate-pulse" />
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Sign up to continue watching
                  </h3>
                  <Button
                    size="lg"
                    className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold px-8"
                    onClick={() => setShowSignUpModal(true)}
                  >
                    Sign Up Free
                  </Button>
                </div>
              </div>
            )}
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

            {content.genre && content.genre.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">GENRES</h3>
                <div className="flex flex-wrap gap-2">
                  {content.genre.map(genre => (
                    <span
                      key={genre}
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
            {content.cast && content.cast.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">CAST</h3>
                <p className="text-gray-300 text-sm">
                  {content.cast.join(", ")}
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
