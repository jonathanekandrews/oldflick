

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiClient as base44 } from "@/api/client";
import { Search, User, LogOut, Menu, X, MoreHorizontal, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterBar from "@/components/browse/FilterBar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // CRITICAL FIX: Initialize state from URL params on mount
  const [activeFilter, setActiveFilter] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('filter') || "all";
  });
  
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const genre = urlParams.get('genre');
    return genre ? [genre] : [];
  });

  useEffect(() => {
    loadUser();
  }, []);

  // Sync state with URL changes (navigation between pages)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const filterParam = urlParams.get('filter');
    const genreParam = urlParams.get('genre');
    
    // Update filter state from URL
    if (filterParam) {
      setActiveFilter(filterParam);
    } else if (currentPageName === "Browse") {
      setActiveFilter("all");
    }
    
    // Update genre state from URL
    if (genreParam) {
      setSelectedGenres([genreParam]);
    } else if (currentPageName === "Browse") {
      setSelectedGenres([]);
    }
  }, [location.pathname, location.search, currentPageName]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log("Anonymous user");
      // Don't do anything - allow anonymous browsing
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(createPageUrl(`Search?q=${encodeURIComponent(searchQuery)}`));
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const showFilterBar = true;
  const hasActiveSubscription = user?.subscription_status === "free_trial" || user?.subscription_status === "active";

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        :root {
          --oldflick-burgundy: #1e3a8a;
          --oldflick-gold: #D4AF37;
          --oldflick-cream: #F5F1E8;
        }
        
        .oldflick-gradient {
          background: linear-gradient(135deg, #000000 0%, #0a0f1a 50%, #0a0a0a 100%);
        }
        
        .content-card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .content-card-hover:hover {
          transform: scale(1.05);
          z-index: 10;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        .logo-gold {
          filter: brightness(0.8) contrast(2) saturate(1.5);
          background-color: #000000;
          mix-blend-mode: lighten;
        }
        
        .logo-nav {
          height: 180px;
          width: auto;
          display: block;
        }
        
        .logo-footer {
          height: 304px;
          width: auto;
          display: block;
        }
        
        .logo-container-nav {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          margin-top: -30px;
          margin-left: 20px;
        }
        
        .tagline-text {
          color: var(--oldflick-gold);
          font-size: 0.5rem;
          font-weight: 300;
          text-transform: uppercase;
          white-space: nowrap;
          text-align: center;
          display: block;
          margin-top: -50px;
          padding: 0;
        }
        
        .tagline-dash {
          letter-spacing: normal;
          margin-right: 6px;
        }
        
        .tagline-word {
          letter-spacing: 3px;
        }
        
        .tagline-space {
          display: inline-block;
          width: 10px;
        }
        
        .tagline-dash-end {
          letter-spacing: normal;
          margin-left: 6px;
        }

        .search-input-large {
          line-height: 1.5 !important;
          font-size: 2.4rem !important;
        }
        
        .search-input-large::placeholder {
          line-height: 1.5 !important;
        }
        
        @media (max-width: 768px) {
          .logo-nav {
            height: 140px;
          }
          .logo-footer {
            height: 252px;
          }
          .tagline-text {
            font-size: 0.4rem;
            margin-top: -40px;
            padding-left: 30px;
          }
          .tagline-dash {
            margin-right: 4px;
          }
          .tagline-word {
            letter-spacing: 2px;
          }
          .tagline-space {
            width: 8px;
          }
          .tagline-dash-end {
            margin-left: 4px;
          }
        }
      `}</style>

      {/* Fixed Header - Unified Control Panel */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        {/* Top Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Logo */}
            <Link to={createPageUrl("Browse")} className="logo-container-nav flex-shrink-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904bf7c50abb3485eec161d/38b9447be_Logo03Oldflick.png"
                alt="OldFlick"
                className="w-auto logo-gold logo-nav"
              />
              <span className="tagline-text">
                <span className="tagline-dash">-</span><span className="tagline-word">C L A S S I C</span><span className="tagline-space"></span><span className="tagline-word">C O N T E N T</span><span className="tagline-dash-end">-</span>
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8 mt-5">
              <div className="relative w-full">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 text-gray-400" />
                <Input
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-20 pr-6 py-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 transition-colors w-full search-input-large"
                />
              </div>
            </form>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {user ? (
                <>
                  {!hasActiveSubscription && (
                    <Link to={createPageUrl("Pricing")}>
                      <Button size="sm" className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold">
                        <Crown className="w-4 h-4 mr-2" />
                        Subscribe
                      </Button>
                    </Link>
                  )}
                  <Link to={createPageUrl("Account")}>
                    <Button variant="ghost" size="sm" className="text-white hover:text-[var(--oldflick-gold)]">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Button>
                  </Link>
                  {user?.role === "admin" && (
                    <Link to={createPageUrl("Admin")}>
                      <Button variant="ghost" size="sm" className="text-white hover:text-[var(--oldflick-gold)]">
                        History
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:text-[var(--oldflick-burgundy)]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => base44.auth.redirectToLogin(location.pathname)}
                    className="text-white hover:text-[var(--oldflick-gold)]"
                  >
                    SIGN IN
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => base44.auth.redirectToLogin(location.pathname)}
                    className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    SIGN UP FREE
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Search - Show only when menu closed */}
          {!mobileMenuOpen && (
            <form onSubmit={handleSearch} className="md:hidden pb-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 transition-colors w-full"
                />
              </div>
            </form>
          )}
        </div>

        {/* Filter Bar - Now visible on all pages */}
        {showFilterBar && (
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            selectedGenres={selectedGenres}
            onGenreToggle={handleGenreToggle}
            currentPage={currentPageName}
          />
        )}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              {user ? (
                <>
                  {!hasActiveSubscription && (
                    <Link
                      to={createPageUrl("Pricing")}
                      className="block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold">
                        <Crown className="w-4 h-4 mr-2" />
                        Subscribe Now
                      </Button>
                    </Link>
                  )}
                  <Link
                    to={createPageUrl("Account")}
                    className="block text-white hover:text-[var(--oldflick-gold)] py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to={createPageUrl("Admin")}
                      className="block text-white hover:text-[var(--oldflick-gold)] py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      History
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-white hover:text-[var(--oldflick-burgundy)] py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      base44.auth.redirectToLogin(location.pathname);
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-[var(--oldflick-gold)]"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      base44.auth.redirectToLogin(location.pathname);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90 font-semibold"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Sign Up Free
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Pass filter state to children */}
      <main className={showFilterBar ? "pt-[200px] md:pt-[180px]" : "pt-[140px] md:pt-[120px]"}>
        {React.cloneElement(children, {
          layoutActiveFilter: activeFilter,
          layoutSelectedGenres: selectedGenres,
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904bf7c50abb3485eec161d/38b9447be_Logo03Oldflick.png"
                alt="OldFlick"
                className="w-40 h-auto logo-gold mb-2"
              />
              <p className="text-[var(--oldflick-gold)] text-xs font-light uppercase tracking-widest mb-4">
                - Classic Content -
              </p>
              <p className="text-sm text-gray-400">
                Classic cinema at your fingertips. Stream timeless movies and TV shows.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Subscription</h4>
              <p className="text-sm text-gray-400 mb-2">24-hour free trial</p>
              <p className="text-lg font-bold text-[var(--oldflick-gold)] mb-3">$2.99/month</p>
              <Link to={createPageUrl("Pricing")}>
                <Button size="sm" className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90 w-full">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 flex items-center justify-center">
            <Link
              to={createPageUrl("SuperAdmin")}
              className="text-gray-600 hover:text-gray-400 transition-colors p-2 cursor-pointer"
              aria-label="Admin Access"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            © 2025 OldFlick. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

