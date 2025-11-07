import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Film, Clock, Star, Heart, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SignUpModal({ isOpen, onClose }) {
  const handleSignUp = () => {
    base44.auth.redirectToLogin();
  };

  const features = [
    { icon: Clock, text: "Unlimited viewing time" },
    { icon: Film, text: "Full access to classic cinema" },
    { icon: Star, text: "No ads or interruptions" },
    { icon: Heart, text: "Create your watchlist" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-[var(--oldflick-gold)]/30 text-white max-w-2xl p-0 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMThjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTE4IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDE4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0wIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDE4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative p-12">
          {/* Gold accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--oldflick-gold)] to-transparent"></div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--oldflick-gold)] to-yellow-600 rounded-full mb-6 animate-pulse">
              <Crown className="w-10 h-10 text-black" />
            </div>

            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-[var(--oldflick-gold)] to-white bg-clip-text text-transparent">
              Your Free Preview Has Ended
            </h2>

            <p className="text-gray-300 text-lg mb-8">
              Sign up to continue enjoying unlimited classic cinema
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm"
                >
                  <Icon className="w-5 h-5 text-[var(--oldflick-gold)] flex-shrink-0" />
                  <span className="text-white text-sm">{feature.text}</span>
                </div>
              );
            })}
          </div>

          {/* Sign Up Benefits */}
          <div className="bg-gradient-to-r from-[var(--oldflick-burgundy)]/30 to-[var(--oldflick-burgundy)]/20 border border-[var(--oldflick-burgundy)]/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[var(--oldflick-gold)] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-2">Get Started Today</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--oldflick-gold)] rounded-full"></div>
                    24-hour free trial available
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--oldflick-gold)] rounded-full"></div>
                    Then just $2.99/month
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--oldflick-gold)] rounded-full"></div>
                    Cancel anytime, no commitments
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSignUp}
              size="lg"
              className="w-full bg-gradient-to-r from-[var(--oldflick-gold)] to-yellow-600 text-black hover:from-[var(--oldflick-gold)]/90 hover:to-yellow-600/90 font-bold text-lg py-6 shadow-lg shadow-[var(--oldflick-gold)]/20"
            >
              <Crown className="w-6 h-6 mr-2" />
              Sign Up Free
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white hover:bg-white/5"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}