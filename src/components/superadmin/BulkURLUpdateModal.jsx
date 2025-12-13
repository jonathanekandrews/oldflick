import React, { useState } from "react";
import { apiClient as base44 } from "@/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, AlertCircle, Check, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function BulkURLUpdateModal({ content, onClose, onComplete }) {
  const [findPattern, setFindPattern] = useState("");
  const [replacePattern, setReplacePattern] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState([]);
  const [matchCount, setMatchCount] = useState(0);

  const generatePreview = () => {
    if (!findPattern || !replacePattern) {
      alert("Please enter both find and replace patterns");
      return;
    }

    const matches = content.filter(item => {
      return (
        item.video_url?.includes(findPattern) ||
        item.thumbnail_url?.includes(findPattern) ||
        item.backdrop_url?.includes(findPattern)
      );
    });

    setMatchCount(matches.length);

    if (matches.length === 0) {
      setPreview([]);
      alert(`No matches found for "${findPattern}"`);
      return;
    }

    const previewData = matches.slice(0, 5).map(item => ({
      title: item.title,
      old_video_url: item.video_url,
      new_video_url: item.video_url?.replace(new RegExp(findPattern, 'g'), replacePattern),
      old_thumbnail_url: item.thumbnail_url,
      new_poster_url: item.poster_url?.replace(new RegExp(findPattern, 'g'), replacePattern),
    }));

    setPreview(previewData);
  };

  const handleUpdate = async () => {
    if (!findPattern || !replacePattern) {
      alert("Please enter both find and replace patterns");
      return;
    }

    if (preview.length === 0) {
      alert("Please preview changes first");
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of content) {
        const needsUpdate = (
          item.video_url?.includes(findPattern) ||
          item.poster_url?.includes(findPattern)
        );

        if (needsUpdate) {
          try {
            const updates = {};

            if (item.video_url?.includes(findPattern)) {
              updates.video_url = item.video_url.replace(new RegExp(findPattern, 'g'), replacePattern);
            }
            if (item.poster_url?.includes(findPattern)) {
              updates.poster_url = item.poster_url.replace(new RegExp(findPattern, 'g'), replacePattern);
            }

            await base44.entities.Content.update(item.id, updates);
            successCount++;
          } catch (error) {
            console.error(`Failed to update ${item.title}:`, error);
            errorCount++;
          }
        }
      }

      setResults({ successCount, errorCount, total: successCount + errorCount });
      
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error("Bulk update error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <RefreshCw className="w-6 h-6 text-[var(--oldflick-gold)]" />
            Bulk URL Update Tool
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!results && (
            <>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">How to use this tool:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Enter the old URL pattern to find (e.g., "oldflick-images-film-masterpieces")</li>
                      <li>Enter the new URL pattern to replace it with (e.g., "oldflick-videos/film_masterpieces")</li>
                      <li>Click "Preview Changes" to see what will be updated</li>
                      <li>Review the preview carefully</li>
                      <li>Click "Apply Updates" to update all matching URLs</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="find-pattern" className="text-white">
                    Find URL Pattern *
                  </Label>
                  <Input
                    id="find-pattern"
                    placeholder="e.g., oldflick-images-film-masterpieces"
                    value={findPattern}
                    onChange={(e) => {
                      setFindPattern(e.target.value);
                      setPreview([]); // Clear preview when pattern changes
                    }}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    The text pattern to search for in URLs
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replace-pattern" className="text-white">
                    Replace With *
                  </Label>
                  <Input
                    id="replace-pattern"
                    placeholder="e.g., oldflick-videos/film_masterpieces"
                    value={replacePattern}
                    onChange={(e) => {
                      setReplacePattern(e.target.value);
                      setPreview([]); // Clear preview when pattern changes
                    }}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    The new text pattern to replace it with
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generatePreview}
                  disabled={!findPattern || !replacePattern}
                  className="bg-[var(--oldflick-gold)] text-black hover:bg-[var(--oldflick-gold)]/90"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Preview Changes
                </Button>
                {!findPattern || !replacePattern ? (
                  <p className="text-sm text-gray-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Enter both patterns to preview
                  </p>
                ) : null}
              </div>

              {preview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Preview (showing {preview.length} of {matchCount} matching items)
                    </h3>
                  </div>

                  <div className="space-y-4 bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {preview.map((item, index) => (
                      <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                        <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                        
                        {item.old_video_url !== item.new_video_url && (
                          <div className="space-y-1 text-sm mb-2">
                            <p className="text-gray-400">Video URL:</p>
                            <p className="text-red-400 break-all">− {item.old_video_url}</p>
                            <p className="text-green-400 break-all">+ {item.new_video_url}</p>
                          </div>
                        )}
                        
                        {item.old_thumbnail_url !== item.new_thumbnail_url && item.old_thumbnail_url && (
                          <div className="space-y-1 text-sm mb-2">
                            <p className="text-gray-400">Thumbnail URL:</p>
                            <p className="text-red-400 break-all">− {item.old_thumbnail_url}</p>
                            <p className="text-green-400 break-all">+ {item.new_thumbnail_url}</p>
                          </div>
                        )}

                        {item.old_backdrop_url !== item.new_backdrop_url && item.old_backdrop_url && (
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-400">Backdrop URL:</p>
                            <p className="text-red-400 break-all">− {item.old_backdrop_url}</p>
                            <p className="text-green-400 break-all">+ {item.new_backdrop_url}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-300">
                        <p className="font-medium">⚠️ Important:</p>
                        <p>This will update {matchCount} content item{matchCount !== 1 ? 's' : ''}. Please review carefully before proceeding.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={isProcessing}
                      className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                    >
                      {isProcessing ? "Updating..." : `Apply Updates (${matchCount} items)`}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-[var(--oldflick-gold)] animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Updating URLs...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we update all matching content</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Check className="w-16 h-16 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Update Complete!</h3>
                <p className="text-gray-400">
                  Successfully updated {results.successCount} of {results.total} items
                </p>
                {results.errorCount > 0 && (
                  <p className="text-red-400 text-sm mt-2">
                    {results.errorCount} items failed to update
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}