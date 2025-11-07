import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionPrompt({ user }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative z-20 -mt-40 mb-8 mx-4 sm:mx-6 lg:mx-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[var(--oldflick-burgundy)] to-[var(--oldflick-burgundy)]/80 rounded-xl p-6 md:p-8 shadow-2xl border border-[var(--oldflick-gold)]/20 relative">
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pr-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--oldflick-gold)] rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {user.free_trial_used ? "Subscribe to Continue Watching" : "Start Your 24-Hour Free Trial"}
                </h3>
                <p className="text-white/90 text-sm">
                  {user.free_trial_used 
                    ? "Unlock unlimited access to classic films and TV shows for just $2.99/month"
                    : "Get 24 hours free, then just $2.99/month. Cancel anytime."
                  }
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold px-8 whitespace-nowrap"
              onClick={() => navigate(createPageUrl("Account"))}
            >
              {user.free_trial_used ? "Subscribe Now" : "Start Free Trial"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}