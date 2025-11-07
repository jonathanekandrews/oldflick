
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, Sparkles, Crown, Film, Tv, Clock, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Pricing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log("User not logged in");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = () => {
    if (!user) return false;
    return user.subscription_status === "free_trial" || user.subscription_status === "active";
  };

  const handleSubscribe = async () => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl("Pricing"));
      return;
    }

    // If they haven't used free trial, go to Account page for free trial
    if (!user.free_trial_used) {
      navigate(createPageUrl("Account"));
      return;
    }

    // Otherwise start paid subscription
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId: 'price_1SQaIJFBv1tO0CA82u7bl2EM',
      mode: 'subscription'
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
      setProcessing(false);
    }
  };

  const getButtonText = () => {
    if (processing) {
      return "Processing...";
    }
    if (!user) {
      return "Get Started";
    }
    if (!user.free_trial_used) {
      return "Start Free Trial";
    }
    return "Subscribe Now";
  };

  const features = [
    { icon: Film, text: "Unlimited classic movies from cinema's golden age" },
    { icon: Tv, text: "Vintage TV shows and series" },
    { icon: Star, text: "Hand-curated collection of timeless content" },
    { icon: Clock, text: "No ads or interruptions" },
    { icon: Heart, text: "Create your personal watchlist" },
    { icon: Sparkles, text: "New arrivals added regularly" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oldflick-gradient">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--oldflick-burgundy)]/20 to-transparent"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--oldflick-gold)] rounded-full mb-6">
            <Crown className="w-8 h-8 text-black" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Stream Classic Cinema
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover timeless movies and TV shows from Hollywood's golden age. 
            Unlimited streaming, no ads, cancel anytime.
          </p>

          {hasActiveSubscription() ? (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">You're subscribed!</span>
            </div>
          ) : (
            <div className="inline-block">
              <p className="text-gray-400 text-sm mb-4">
                {user && !user.free_trial_used ? "Start with a 24-hour free trial" : "Subscribe now"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-[var(--oldflick-gold)]/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--oldflick-gold)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <CardContent className="relative p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-[var(--oldflick-burgundy)] rounded-full mb-4">
                <span className="text-[var(--oldflick-gold)] font-semibold text-sm uppercase tracking-wider">
                  Best Value
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                OldFlick Premium
              </h2>
              
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl md:text-6xl font-bold text-[var(--oldflick-gold)]">
                  $2.99
                </span>
                <span className="text-2xl text-gray-400">/month</span>
              </div>

              {user && !user.free_trial_used && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--oldflick-gold)]/20 border border-[var(--oldflick-gold)]/30 rounded-full">
                  <Sparkles className="w-4 h-4 text-[var(--oldflick-gold)]" />
                  <span className="text-[var(--oldflick-gold)] font-medium text-sm">
                    24-Hour Free Trial Available
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--oldflick-burgundy)]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[var(--oldflick-gold)]" />
                    </div>
                    <span className="text-white text-lg">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            {!hasActiveSubscription() && (
              <div className="space-y-4">
                <Button
                  onClick={handleSubscribe}
                  disabled={processing}
                  size="lg"
                  className="w-full bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90 text-white font-bold text-lg py-6 h-auto"
                >
                  {processing && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  )}
                  {getButtonText()}
                </Button>
                
                <p className="text-center text-sm text-gray-400">
                  {user && !user.free_trial_used 
                    ? "No payment required for trial. Try it free for 24 hours."
                    : "Cancel anytime. No long-term commitments."}
                </p>
              </div>
            )}

            {hasActiveSubscription() && (
              <div className="text-center">
                <Button
                  onClick={() => navigate(createPageUrl("Account"))}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Manage Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ / Additional Info */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">Can I cancel anytime?</h4>
                <p className="text-gray-400 text-sm">
                  Yes! Cancel your subscription at any time with no penalties or fees. You'll have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">What's included?</h4>
                <p className="text-gray-400 text-sm">
                  Unlimited streaming of our entire classic film and TV collection, with no ads, and new content added regularly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">How does the free trial work?</h4>
                <p className="text-gray-400 text-sm">
                  New users get 24 hours completely free with full access. No payment method required for the trial.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-2">What devices can I watch on?</h4>
                <p className="text-gray-400 text-sm">
                  Stream on any device with a web browser - desktop, laptop, tablet, or mobile phone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
