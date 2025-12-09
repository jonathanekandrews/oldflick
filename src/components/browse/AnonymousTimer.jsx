import React, { useState, useEffect } from "react";
import { Clock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient as base44 } from "@/api/client";

const GRACE_PERIOD_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_1_MS = 25 * 60 * 1000; // 25 minutes (5 min left)
const WARNING_2_MS = 28 * 60 * 1000; // 28 minutes (2 min left)

// TO RE-ENABLE FREE PREVIEW TIMER: Change this to false
const DISABLE_PREVIEW_TIMER = true;

export default function AnonymousTimer({ user, onTimeExpired }) {
  // Timer disabled - return nothing
  if (DISABLE_PREVIEW_TIMER) return null;
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // If user is logged in, don't show timer
    if (user) {
      setTimeLeft(null);
      setShowWarning(false);
      return;
    }

    // Get or set first visit timestamp
    let firstVisit = localStorage.getItem('oldflick_first_visit');
    if (!firstVisit) {
      firstVisit = Date.now().toString();
      localStorage.setItem('oldflick_first_visit', firstVisit);
    }

    const updateTimer = () => {
      const elapsed = Date.now() - parseInt(firstVisit);
      const remaining = GRACE_PERIOD_MS - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        if (onTimeExpired) onTimeExpired();
        return;
      }

      setTimeLeft(remaining);

      // Show warning banner at 5 minutes and 2 minutes left
      if (elapsed >= WARNING_2_MS || elapsed >= WARNING_1_MS) {
        setShowWarning(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user, onTimeExpired]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin();
  };

  // Don't show anything if user is logged in or time not set
  if (!timeLeft || user) return null;

  const minutesLeft = Math.floor(timeLeft / 60000);

  return (
    <>
      {/* Floating Timer Badge */}
      {timeLeft > 0 && minutesLeft <= 10 && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[var(--oldflick-gold)]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--oldflick-gold)] animate-pulse" />
              <div>
                <div className="text-white font-bold text-lg">{formatTime(timeLeft)}</div>
                <div className="text-gray-400 text-xs">Free time left</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {showWarning && timeLeft > 0 && (
        <div className="fixed top-20 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[var(--oldflick-gold)] rounded-xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--oldflick-gold)] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {minutesLeft} {minutesLeft === 1 ? 'minute' : 'minutes'} of free viewing left!
                    </h3>
                    <p className="text-gray-300">
                      Sign up now for unlimited access to classic cinema
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold px-8 whitespace-nowrap"
                  onClick={handleSignUp}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const getTimeLeft = () => {
  const firstVisit = localStorage.getItem('oldflick_first_visit');
  if (!firstVisit) return GRACE_PERIOD_MS;

  const elapsed = Date.now() - parseInt(firstVisit);
  const remaining = GRACE_PERIOD_MS - elapsed;
  return Math.max(0, remaining);
};

export const hasTimeExpired = () => {
  // Timer disabled - never expire
  if (DISABLE_PREVIEW_TIMER) return false;
  return getTimeLeft() <= 0;
};

export const resetTimer = () => {
  localStorage.removeItem('oldflick_first_visit');
};