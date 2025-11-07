
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Mail, Calendar, CreditCard, Crown, Sparkles, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, differenceInDays, differenceInHours } from "date-fns";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadUser();
    
    // Check for success/cancel params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
            setShowSuccess(true);
      setTimeout(() => loadUser(), 1000);
    }
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      base44.auth.redirectToLogin(createPageUrl("Account"));
    }
  };

  const startFreeTrial = async () => {
    if (user.free_trial_used) return;

    setProcessing(true);
    const startDate = new Date();
    const endDate = addDays(startDate, 1); // 1 day = 24 hours

    await base44.auth.updateMe({
      subscription_status: "free_trial",
      subscription_start_date: startDate.toISOString(),
      subscription_end_date: endDate.toISOString(),
      free_trial_used: true
    });

    await loadUser();
    setProcessing(false);
  };

  const activateSubscription = async () => {
    setProcessing(true);
    
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
      priceId: 'price_1SQaIJFBv1tO0CA82u7bl2EM',
            mode: 'subscription'
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
      setProcessing(false);
    }
  };

  const manageSubscription = async () => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('createPortalSession');
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open subscription management. Please try again.');
      setProcessing(false);
    }
  };

  const getTimeRemaining = () => {
    if (!user.subscription_end_date) return { hours: 0, minutes: 0, days: 0 };
    const endDate = new Date(user.subscription_end_date);
    const now = new Date();
    // differenceInHours floors the value. E.g., 25.5 hours -> 25 hours.
    const totalFlooredHours = differenceInHours(endDate, now); 
    const days = Math.floor(totalFlooredHours / 24);
    // The 'hours' value will be the remainder of the floored total hours after days are accounted for.
    const hours = totalFlooredHours % 24; 
    // To get precise minutes, we use the raw millisecond difference.
    const preciseRemainingMinutes = Math.floor((endDate.getTime() - now.getTime()) / 60000) % 60;
    
    // Return values need to be carefully interpreted by formatTimeRemaining.
    // 'hours' here is the total floored hours (e.g., 25 for 25.5 hours) for easier calculation in formatTimeRemaining.
    // 'days' is derived from totalFlooredHours.
    return { 
      hours: totalFlooredHours > 0 ? totalFlooredHours : 0, 
      minutes: preciseRemainingMinutes > 0 ? preciseRemainingMinutes : 0, 
      days: days > 0 ? days : 0 
    };
  };

  const getSubscriptionStatusDisplay = () => {
    switch (user?.subscription_status) {
      case "free_trial":
        return {
          label: "Free Trial (24 Hours)",
          color: "text-[var(--oldflick-gold)]",
          bgColor: "bg-[var(--oldflick-gold)]/10",
          icon: Sparkles
        };
      case "active":
        return {
          label: "Active Subscription",
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          icon: Crown
        };
      case "expired":
        return {
          label: "Expired",
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          icon: Clock
        };
      default:
        return {
          label: "No Subscription",
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
          icon: CreditCard
        };
    }
  };

  const formatTimeRemaining = () => {
    const time = getTimeRemaining();
    const { hours: totalFlooredHours, minutes: preciseRemainingMinutes, days: totalDaysFromFlooredHours } = time;
    
    // For free trials, always show total hours, with a special message if it exceeds 24.
    if (user.subscription_status === "free_trial") {
        if (totalFlooredHours === 0) { // Less than 1 hour, so show minutes
            return `${preciseRemainingMinutes} minute${preciseRemainingMinutes === 1 ? '' : 's'}`;
        }
        if (totalFlooredHours >= 24) {
            // This case should ideally not happen for a 24-hour trial, unless data is inconsistent.
            return `${totalFlooredHours} hours (check subscription)`;
        }
        return `${totalFlooredHours} hour${totalFlooredHours === 1 ? '' : 's'}`;
    }
    
    // For active subscriptions, show days, hours, or minutes based on magnitude.
    if (totalDaysFromFlooredHours > 0) {
      return `${totalDaysFromFlooredHours} day${totalDaysFromFlooredHours === 1 ? '' : 's'}`;
    } else if (totalFlooredHours > 0) { // If less than a day, but some hours remain
      return `${totalFlooredHours} hour${totalFlooredHours === 1 ? '' : 's'}`;
    } else if (preciseRemainingMinutes > 0) { // If less than an hour, but minutes remain
      return `${preciseRemainingMinutes} minute${preciseRemainingMinutes === 1 ? '' : 's'}`;
    }
    return "Less than a minute"; // Effectively expired or very short time left
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  const statusDisplay = getSubscriptionStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  const hasActiveSubscription = user.subscription_status === "free_trial" || user.subscription_status === "active";
  const timeRemaining = getTimeRemaining(); // Still need to call this to pass to formatTimeRemaining

  return (
    <div className="min-h-screen oldflick-gradient py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">Your subscription has been activated successfully.</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setShowSuccess(false)}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            My Account
          </h1>
          <p className="text-gray-400">
            Manage your profile and subscription
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-medium">{user.full_name || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="font-medium">
                    {format(new Date(user.created_date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusDisplay.bgColor}`}>
                  <StatusIcon className={`w-5 h-5 ${statusDisplay.color}`} />
                  <span className={`font-semibold ${statusDisplay.color}`}>
                    {statusDisplay.label}
                  </span>
                </div>
              </div>

              {hasActiveSubscription ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Status</span>
                      <span className="text-white font-medium">
                        {user.subscription_status === "free_trial" ? "Free Trial (24h)" : "Premium"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Time Remaining</span>
                      <span className="text-white font-medium">
                        {formatTimeRemaining()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        {user.subscription_status === "free_trial" ? "Ends On" : "Renews On"}
                      </span>
                      <span className="text-white font-medium">
                        {format(new Date(user.subscription_end_date), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>

                  {user.subscription_status === "free_trial" && (
                    <div className="p-4 bg-[var(--oldflick-burgundy)]/20 border border-[var(--oldflick-burgundy)]/30 rounded-lg">
                      <p className="text-white mb-4">
                        Your 24-hour free trial ends soon. Subscribe now for uninterrupted access!
                      </p>
                      <Button
                        onClick={activateSubscription}
                        disabled={processing}
                        className="w-full bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                      >
                        {processing ? "Processing..." : "Subscribe for $2.99/month"}
                      </Button>
                    </div>
                  )}

                  {user.subscription_status === "active" && user.stripe_subscription_id && (
                    <Button
                      onClick={manageSubscription}
                      disabled={processing}
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white/10"
                    >
                      {processing ? "Loading..." : "Manage Subscription"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!user.free_trial_used ? (
                    <div className="p-6 bg-gradient-to-r from-[var(--oldflick-burgundy)] to-[var(--oldflick-burgundy)]/80 rounded-lg">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-[var(--oldflick-gold)] rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            Start Your 24-Hour Free Trial
                          </h3>
                          <p className="text-white/90">
                            Get 24 hours of unlimited access to classic movies and TV shows
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-6 text-white/90 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[var(--oldflick-gold)] rounded-full"></div>
                          24 hours unlimited streaming
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[var(--oldflick-gold)] rounded-full"></div>
                          No ads or interruptions
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[var(--oldflick-gold)] rounded-full"></div>
                          No payment required for trial
                        </li>
                      </ul>
                      <Button
                        onClick={startFreeTrial}
                        disabled={processing}
                        className="w-full bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold"
                      >
                        {processing ? "Processing..." : "Start 24-Hour Free Trial"}
                      </Button>
                      <p className="text-xs text-white/70 text-center mt-3">
                        Then $2.99/month after trial ends
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 bg-white/5 rounded-lg">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Subscribe to OldFlick
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Continue enjoying unlimited access to classic cinema
                      </p>
                      <div className="mb-6">
                        <div className="text-3xl font-bold text-[var(--oldflick-gold)] mb-2">
                          $2.99<span className="text-lg text-gray-400">/month</span>
                        </div>
                      </div>
                      <Button
                        onClick={activateSubscription}
                        disabled={processing}
                        className="w-full bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                      >
                        {processing ? "Processing..." : "Subscribe Now"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Watch History */}
          {user.watch_history && user.watch_history.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  You've watched {user.watch_history.length} {user.watch_history.length === 1 ? "title" : "titles"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Browse"))}
            className="border-[var(--oldflick-burgundy)] text-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)] hover:text-white"
          >
            Back to Browse
          </Button>
        </div>
      </div>
    </div>
  );
}
