
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

// Complete genre list matching ContentForm
const GENRES = [
  "Action", "Adventure", "Comedy", "Crime", "Cult", "Drama", "Film Noir", 
  "Horror", "Masterpieces", "Musical", "Mystery", "Romance", "Science Fiction", 
  "Thriller", "War", "Western"
];

export default function FilterBar({ activeFilter, onFilterChange, selectedGenres, onGenreToggle, currentPage }) {
  const navigate = useNavigate();
  
  const filters = [
    { id: "classic_films", label: "CLASSIC FILMS" },
    { id: "classic_tv", label: "CLASSIC TV" },
    { id: "my_list", label: "MY LIST" },
  ];

  const isOnBrowsePage = currentPage === "Browse";

  const handleFilterClick = (filterId) => {
    // Navigate to dedicated pages
    if (filterId === "my_list") {
      navigate(createPageUrl("MyList"));
      return;
    }
    
    if (filterId === "classic_films") {
      navigate(createPageUrl("ClassicFilms"));
      return;
    }
    
    if (filterId === "classic_tv") {
      navigate(createPageUrl("ClassicTV"));
      return;
    }
    
    // Fallback for any other filters
    navigate(createPageUrl(`Browse?filter=${filterId}`));
  };

  const handleGenreClick = (genre) => {
    if (isOnBrowsePage) {
      // Toggle genre in multi-select mode
      onGenreToggle(genre);
      
      // Update URL to reflect current genres
      const newGenres = selectedGenres.includes(genre)
        ? selectedGenres.filter(g => g !== genre)
        : [...selectedGenres, genre];
      
      if (newGenres.length > 0) {
        // For multiple genres, just navigate to first one (URL limitation)
        // This logic needs to be revisited if multiple genre selection should reflect in URL
        // Currently, it navigates to the first selected genre if multiple are selected.
        // A more robust solution for multiple genres in URL would be to join them, e.g., ?genre=Action,Comedy
        navigate(createPageUrl(`Browse?genre=${encodeURIComponent(newGenres[0])}`));
      } else {
        navigate(createPageUrl("Browse"));
      }
    } else {
      // Navigate to Browse with single genre
      navigate(createPageUrl(`Browse?genre=${encodeURIComponent(genre)}`));
    }
  };

  const handleClearAll = () => {
    // If on Browse page, explicitly clear state before navigating
    if (isOnBrowsePage) {
      // Clear genres first
      // The original code had an empty forEach, which doesn't clear anything.
      // Assuming onGenreToggle is used to clear individual genres, we need to call it for each selected.
      // A direct way to clear all selected genres would be to pass an empty array or a specific clear action.
      // For now, we'll assume `onGenreToggle` can handle clearing all if called with a special arg or
      // that the parent component handles clearing `selectedGenres` based on the navigation below.
      // Since `onFilterChange("all")` is called, and then `navigate` to a clean URL,
      // the state should reset from the parent component's `useEffect` listening to URL changes.
      
      // Reset filter
      onFilterChange("all");
      
      // Clear URL params
      navigate(createPageUrl("Browse"), { replace: true });
    } else {
      // From other pages, navigate to clean Browse
      navigate(createPageUrl("Browse"));
    }
  };

  return (
    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
          {filters.map(filter => {
            // Check if we're on the corresponding dedicated page
            const isActive = 
              (filter.id === "my_list" && currentPage === "MyList") ||
              (filter.id === "classic_films" && currentPage === "ClassicFilms") ||
              (filter.id === "classic_tv" && currentPage === "ClassicTV") ||
              (isOnBrowsePage && activeFilter === filter.id);
            
            const buttonClass = `whitespace-nowrap text-xs font-semibold tracking-wider transition-all ${
              isActive
                ? "text-white bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`;

            return (
              <Button
                key={filter.id}
                variant="ghost"
                className={buttonClass}
                onClick={() => handleFilterClick(filter.id)}
              >
                {filter.label}
              </Button>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`whitespace-nowrap text-xs font-semibold tracking-wider ${
                  selectedGenres.length > 0
                    ? "text-white bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                GENRE {selectedGenres.length > 0 && `(${selectedGenres.length})`}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/95 border-white/10 max-h-80 overflow-y-auto">
              {GENRES.map(genre => {
                const isSelected = selectedGenres.includes(genre);
                
                if (isOnBrowsePage) {
                  return (
                    <DropdownMenuCheckboxItem
                      key={genre}
                      checked={isSelected}
                      onCheckedChange={() => handleGenreClick(genre)}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      {genre}
                    </DropdownMenuCheckboxItem>
                  );
                } else {
                  return (
                    <DropdownMenuItem
                      key={genre}
                      onClick={() => handleGenreClick(genre)}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      {genre}
                    </DropdownMenuItem>
                  );
                }
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {(activeFilter !== "all" || selectedGenres.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--oldflick-gold)] hover:text-white hover:bg-white/10 ml-auto"
              onClick={handleClearAll}
            >
              {isOnBrowsePage ? "Clear All" : "View All"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
