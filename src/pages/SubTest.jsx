import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, XCircle, AlertCircle, Clock, Crown, User, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTimeLeft, hasTimeExpired, resetTimer } from "../components/browse/AnonymousTimer";
import { addDays } from "date-fns";

export default function SubTest() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [anonymousTimeLeft, setAnonymousTimeLeft] = useState(null);

  useEffect(() => {
    loadUser();
    updateAnonymousTimer();
    const interval = setInterval(updateAnonymousTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log("No user logged in");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateAnonymousTimer = () => {
    const timeLeft = getTimeLeft();
    const expired = hasTimeExpired();
    setAnonymousTimeLeft({ timeLeft, expired });
  };

  const addResult = (test, passed, message) => {
    setTestResults(prev => [...prev, { test, passed, message, timestamp: new Date() }]);
  };

  // Test Functions
  const testAnonymousAccess = () => {
    addResult("Anonymous Access", !user, user ? "User is logged in" : "User is anonymous ✓");
    const timeLeft = getTimeLeft();
    const hasExpired = hasTimeExpired();
    addResult("Anonymous Timer", timeLeft > 0, `Time left: ${Math.floor(timeLeft / 1000 / 60)} minutes`);
    addResult("Anonymous Expired", hasExpired, hasExpired ? "Timer expired - should show sign-up modal" : "Timer active");
  };

  const testAuthenticatedUser = async () => {
    if (!user) {
      addResult("User Auth", false, "No user logged in");
      return;
    }
    
    addResult("User Auth", true, `User: ${user.email}`);
    addResult("User Role", user.role === "admin" || user.role === "user", `Role: ${user.role}`);
    addResult("User ID", !!user.id, `ID: ${user.id}`);
  };

  const testSubscriptionStatus = async () => {
    if (!user) {
      addResult("Subscription Status", false, "No user logged in");
      return;
    }

    const status = user.subscription_status;
    addResult("Subscription Status", !!status, `Status: ${status || "none"}`);
    
    if (status === "free_trial" || status === "active") {
      addResult("Access Level", true, "User has active subscription");
      
      if (user.subscription_end_date) {
        const endDate = new Date(user.subscription_end_date);
        const now = new Date();
        const hoursLeft = Math.floor((endDate - now) / 1000 / 60 / 60);
        addResult("Time Remaining", hoursLeft > 0, `${hoursLeft} hours remaining`);
      }
    } else {
      addResult("Access Level", false, "No active subscription");
    }

    addResult("Free Trial Used", user.free_trial_used !== undefined, `Used: ${user.free_trial_used}`);
    addResult("Stripe Customer", !!user.stripe_customer_id, user.stripe_customer_id ? "Connected" : "Not connected");
  };

  const testVideoAccess = async () => {
    if (!user) {
      const expired = hasTimeExpired();
      addResult("Video Access (Anonymous)", !expired, expired ? "Blocked - timer expired" : "Allowed - within 30 min");
      return;
    }

    const hasActiveSubscription = user.subscription_status === "free_trial" || user.subscription_status === "active";
    addResult("Video Access (User)", hasActiveSubscription, hasActiveSubscription ? "Allowed" : "Blocked - no subscription");
  };

  const testStripeIntegration = async () => {
    if (!user) {
      addResult("Stripe", false, "No user logged in");
      return;
    }

    addResult("Stripe Customer ID", !!user.stripe_customer_id, user.stripe_customer_id || "Not set");
    addResult("Stripe Subscription ID", !!user.stripe_subscription_id, user.stripe_subscription_id || "Not set");
  };

  // Manual Control Functions
  const simulateExpiredAnonymous = () => {
    localStorage.setItem('oldflick_first_visit', Date.now() - (31 * 60 * 1000));
    updateAnonymousTimer();
    addResult("Simulate", true, "Anonymous timer set to expired");
  };

  const simulateExpiredTrial = async () => {
    if (!user) {
      addResult("Simulate", false, "No user logged in");
      return;
    }

    const expiredDate = addDays(new Date(), -1);
    await base44.auth.updateMe({
      subscription_status: "expired",
      subscription_end_date: expiredDate.toISOString()
    });
    await loadUser();
    addResult("Simulate", true, "Trial set to expired");
  };

  const simulateActiveTrial = async () => {
    if (!user) {
      addResult("Simulate", false, "No user logged in");
      return;
    }

    const startDate = new Date();
    const endDate = addDays(startDate, 1);
    await base44.auth.updateMe({
      subscription_status: "free_trial",
      subscription_start_date: startDate.toISOString(),
      subscription_end_date: endDate.toISOString(),
      free_trial_used: true
    });
    await loadUser();
    addResult("Simulate", true, "24-hour trial activated");
  };

  const resetAnonymousTimer = () => {
    resetTimer();
    updateAnonymousTimer();
    addResult("Reset", true, "Anonymous timer reset - 30 minutes granted");
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult("Test Suite", true, "Starting comprehensive test...");
    
    testAnonymousAccess();
    await testAuthenticatedUser();
    await testSubscriptionStatus();
    await testVideoAccess();
    await testStripeIntegration();
    
    addResult("Test Suite", true, "All tests completed");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oldflick-gradient py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
            Subscription Authentication Test Suite
          </h1>
          <p className="text-gray-400">
            Headless testing dashboard for subscription flows and authentication
          </p>
        </div>

        {/* Current Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Status */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                User Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-white text-sm">Authenticated</span>
                  </div>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                  <p className="text-gray-400 text-xs">Role: {user.role}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-white text-sm">Anonymous</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-[var(--oldflick-gold)]" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <p className="text-white font-semibold">{user.subscription_status || "none"}</p>
                  {user.subscription_end_date && (
                    <p className="text-gray-400 text-xs">
                      Ends: {new Date(user.subscription_end_date).toLocaleString()}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs">
                    Free trial: {user.free_trial_used ? "Used" : "Available"}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Not logged in</p>
              )}
            </CardContent>
          </Card>

          {/* Anonymous Timer */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Anonymous Timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anonymousTimeLeft && (
                <div className="space-y-2">
                  {anonymousTimeLeft.expired ? (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-400 text-sm">Expired</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-400 text-sm">Active</span>
                    </div>
                  )}
                  <p className="text-gray-400 text-xs">
                    Time left: {Math.floor(anonymousTimeLeft.timeLeft / 1000 / 60)} min
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="bg-white/5 border-white/10 mb-6">
            <TabsTrigger value="tests">Run Tests</TabsTrigger>
            <TabsTrigger value="simulate">Simulate States</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          {/* Run Tests Tab */}
          <TabsContent value="tests">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Automated Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runAllTests}
                  className="w-full bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                >
                  Run All Tests
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={testAnonymousAccess}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Test Anonymous Access
                  </Button>

                  <Button
                    onClick={testAuthenticatedUser}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Test User Auth
                  </Button>

                  <Button
                    onClick={testSubscriptionStatus}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Test Subscription
                  </Button>

                  <Button
                    onClick={testVideoAccess}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Test Video Access
                  </Button>

                  <Button
                    onClick={testStripeIntegration}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Test Stripe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulate States Tab */}
          <TabsContent value="simulate">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Simulate States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ These actions will modify your current session state
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={simulateExpiredAnonymous}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Expire Anonymous Timer (31 min)
                  </Button>

                  <Button
                    onClick={resetAnonymousTimer}
                    variant="outline"
                    className="w-full border-green-500 text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reset Anonymous Timer (30 min)
                  </Button>

                  {user && (
                    <>
                      <Button
                        onClick={simulateActiveTrial}
                        variant="outline"
                        className="w-full border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Activate 24h Trial
                      </Button>

                      <Button
                        onClick={simulateExpiredTrial}
                        variant="outline"
                        className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Expire Trial
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={() => navigate(createPageUrl("Account"))}
                    variant="outline"
                    className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Go to Account Page
                  </Button>

                  <Button
                    onClick={() => navigate(createPageUrl("Browse"))}
                    variant="outline"
                    className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Test Browse Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Test Results ({testResults.length})</span>
                  <Button
                    onClick={() => setTestResults([])}
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No test results yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.passed
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {result.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${result.passed ? "text-green-400" : "text-red-400"}`}>
                              {result.test}
                            </p>
                            <p className="text-gray-300 text-sm">{result.message}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {result.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-white/5 border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {!user ? (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90"
                >
                  Sign In / Sign Up
                </Button>
              ) : (
                <Button
                  onClick={() => base44.auth.logout()}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Sign Out
                </Button>
              )}

              <Button
                onClick={() => navigate(createPageUrl("Browse"))}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Browse
              </Button>

              <Button
                onClick={() => navigate(createPageUrl("Account"))}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}