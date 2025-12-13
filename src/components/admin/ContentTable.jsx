
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Film, Tv, Sparkles, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function ContentTable({ content, isLoading, onEdit, onDelete, onEnrich, isDeleting, showEnrichButton = false }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="py-20 text-center">
          <p className="text-gray-400 text-lg">No content added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                {showEnrichButton && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    AI Status
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {content.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100"}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium text-white">{item.title}</div>
                        {item.director && (
                          <div className="text-sm text-gray-400">Dir: {item.director}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.type === "movie" ? (
                        <Film className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Tv className="w-4 h-4 text-purple-500" />
                      )}
                      <span className="text-white capitalize">{item.type?.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{item.release_year}</td>
                  <td className="px-6 py-4">
                    {item.rating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-white">{item.rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  {showEnrichButton && (
                    <td className="px-6 py-4">
                      {item.ai_enriched ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <Check className="w-3 h-3" />
                          Enriched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                          <AlertCircle className="w-3 h-3" />
                          Basic
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {format(new Date(item.created_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {showEnrichButton && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEnrich(item)}
                          className="text-[var(--oldflick-gold)] hover:text-[var(--oldflick-gold)]/80 hover:bg-[var(--oldflick-gold)]/10"
                          title="AI Enrich"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(item)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(item.id)}
                        disabled={isDeleting}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
