
import React, { useState } from "react";
import { apiClient as base44 } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check, X } from "lucide-react";

export default function AIEnrichmentPanel({ content, onComplete, onCancel }) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [error, setError] = useState(null);

  const handleEnrich = async () => {
    setIsEnriching(true);
    setError(null);

    try {
      const prompt = `Given this classic ${content.content_type === "film" ? "film" : "TV show"}:
Title: "${content.title || 'Unknown'}"
Year: ${content.release_year || "Unknown"}
Type: ${content.content_type || "film"}
${content.description ? `Synopsis: ${content.description}` : ""}
${content.director ? `Director: ${content.director}` : ""}
${content.actors && content.actors.length > 0 ? `Cast: ${content.actors.join(", ")}` : ""}

Please provide comprehensive enrichment data for this classic content. Search the internet for accurate information and provide detailed, historically accurate information.

Return the data in the following JSON structure. Be thorough and detailed:`;

      const responseSchema = {
        type: "object",
        properties: {
          cast: {
            type: "array",
            items: { type: "string" },
            description: "Full cast list with top 10-15 actors"
          },
          director: {
            type: "string",
            description: "Director's full name"
          },
          description: {
            type: "string",
            description: "Detailed plot synopsis, 2-3 paragraphs"
          },
          genre: {
            type: "array",
            items: { type: "string" },
            description: "Primary genres (2-5)"
          },
          themes: {
            type: "array",
            items: { type: "string" },
            description: "Content themes like War, Crime, Family, Redemption, etc."
          },
          mood: {
            type: "array",
            items: { type: "string" },
            description: "Mood/tone tags like Suspenseful, Romantic, Dark, Lighthearted, etc."
          },
          era: {
            type: "string",
            description: "Historical era classification like 'Golden Age (1930s)', 'Film Noir Era', 'Pre-Code', etc."
          },
          imdb_rating: {
            type: "number",
            description: "IMDb rating out of 10, if available"
          },
          rating: {
            type: "string",
            description: "Content rating like PG, PG-13, R, NR, etc."
          },
          duration: {
            type: "string",
            description: "Runtime in format like '120 min' for movies or 'Season 1, 8 episodes' for TV"
          },
          historical_context: {
            type: "string",
            description: "Historical significance, cultural impact, and context (2-3 sentences)"
          },
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "15-20 searchable keywords for discovery"
          }
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: responseSchema
      });

      setEnrichedData(result);
      
      // Auto-apply enrichment
      setTimeout(() => {
        onComplete(result);
      }, 1500);
      
    } catch (err) {
      console.error("Enrichment error:", err);
      setError(err?.message || "Failed to enrich content. Please try again.");
    } finally {
      setIsEnriching(false);
    }
  };

  React.useEffect(() => {
    // Auto-start enrichment when panel opens
    if (!enrichedData && !isEnriching && !error) {
      handleEnrich();
    }
  }, []);

  return (
    <Card className="bg-gradient-to-br from-[var(--oldflick-burgundy)]/20 to-[var(--oldflick-burgundy)]/5 border-[var(--oldflick-gold)]/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[var(--oldflick-gold)]" />
          AI Content Enrichment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
          <p className="text-gray-400 text-sm">
            {content.release_year} • {content.content_type === "film" ? "Film" : "TV Show"}
          </p>
        </div>

        {isEnriching && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[var(--oldflick-gold)] animate-spin mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Enriching content with AI...</p>
              <p className="text-gray-400 text-sm">Gathering data from the internet</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleEnrich}
                className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {enrichedData && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <Check className="w-5 h-5" />
              <span className="font-medium">Enrichment complete! Applying changes...</span>
            </div>

            <div className="grid gap-4">
              {enrichedData.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">ENHANCED DESCRIPTION</h4>
                  <p className="text-white text-sm">{enrichedData.description}</p>
                </div>
              )}

              {enrichedData.cast && enrichedData.cast.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">CAST ({enrichedData.cast.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichedData.cast.slice(0, 10).map((actor, i) => (
                      <Badge key={i} className="bg-white/10 text-white">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {enrichedData.genre && enrichedData.genre.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">GENRES</h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichedData.genre.map((g, i) => (
                      <Badge key={i} className="bg-[var(--oldflick-burgundy)] text-white">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {enrichedData.themes && enrichedData.themes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">THEMES</h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichedData.themes.map((t, i) => (
                      <Badge key={i} className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {enrichedData.mood && enrichedData.mood.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">MOOD</h4>
                  <div className="flex flex-wrap gap-2">
                    {enrichedData.mood.map((m, i) => (
                      <Badge key={i} className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {enrichedData.era && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">ERA</h4>
                  <Badge className="bg-[var(--oldflick-gold)]/20 text-[var(--oldflick-gold)] border border-[var(--oldflick-gold)]/30">
                    {enrichedData.era}
                  </Badge>
                </div>
              )}

              {enrichedData.rating && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">RATING</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="text-white font-bold text-xl">{enrichedData.rating}/10</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
