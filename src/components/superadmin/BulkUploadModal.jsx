import React, { useState } from "react";
import { apiClient as base44 } from "@/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, Check, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function BulkUploadModal({ onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (ext === 'csv' || ext === 'xlsx') {
        setFile(selectedFile);
      } else {
        alert("Please upload a CSV or Excel file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10);
    setStatus("Uploading file...");

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProgress(30);
      setStatus("Extracting content data...");

      // Define schema for content extraction
      const contentSchema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            type: { type: "string", enum: ["movie", "tv_show"] },
            release_year: { type: "number" },
            description: { type: "string" },
            video_url: { type: "string" },
            poster_url: { type: "string" },
            director: { type: "string" },
            actors: { type: "array", items: { type: "string" } },
            genre: { type: "array", items: { type: "string" } },
            rating: { type: "number" },
            runtime_minutes: { type: "number" },
            content_type: { type: "string" }
          },
          required: ["title", "type", "video_url"]
        }
      };

      // Extract data from file
      const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: contentSchema
      });

      if (extraction.status === "error") {
        throw new Error(extraction.details || "Failed to extract data from file");
      }

      const contentData = extraction.output;
      setProgress(50);
      setStatus(`Processing ${contentData.length} items...`);

      // Bulk create content with AI enrichment
      let successCount = 0;
      let errorCount = 0;
      const total = contentData.length;

      for (let i = 0; i < contentData.length; i++) {
        const item = contentData[i];
        try {
          // Create content
          const created = await base44.entities.Content.create(item);
          
          // Auto-enrich with AI
          setStatus(`Enriching ${i + 1}/${total}: ${item.title}...`);
          
          try {
            const prompt = `Enrich this classic ${item.content_type}: "${item.title}" (${item.release_year}). Provide comprehensive data.`;
            
            const enrichmentSchema = {
              type: "object",
              properties: {
                cast: { type: "array", items: { type: "string" } },
                director: { type: "string" },
                description: { type: "string" },
                genre: { type: "array", items: { type: "string" } },
                themes: { type: "array", items: { type: "string" } },
                mood: { type: "array", items: { type: "string" } },
                era: { type: "string" },
                imdb_rating: { type: "number" },
                keywords: { type: "array", items: { type: "string" } },
                historical_context: { type: "string" }
              }
            };

            const enriched = await base44.integrations.Core.InvokeLLM({
              prompt,
              add_context_from_internet: true,
              response_json_schema: enrichmentSchema
            });

            // Update with enriched data
            await base44.entities.Content.update(created.id, {
              ...enriched,
              ai_enriched: true,
              ai_enriched_date: new Date().toISOString()
            });
          } catch (enrichError) {
            console.log(`Enrichment failed for ${item.title}, but content created`);
          }

          successCount++;
        } catch (error) {
          console.error(`Failed to create ${item.title}:`, error);
          errorCount++;
        }

        // Update progress
        setProgress(50 + ((i + 1) / total) * 50);
      }

      setResults({ successCount, errorCount, total });
      setStatus("Upload complete!");
      setProgress(100);

      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error("Bulk upload error:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Upload className="w-6 h-6 text-[var(--oldflick-gold)]" />
            Bulk Content Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isUploading && !results && (
            <>
              <div>
                <p className="text-gray-400 mb-4">
                  Upload a CSV or Excel file with content data. The file should include columns for: title, type, year, video_url, and optionally: description, director, cast, genre, etc.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <p className="font-medium mb-1">AI Auto-Enrichment Enabled</p>
                      <p>Each item will be automatically enriched with AI-gathered data including cast, themes, era, and more.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-white">
                  Select File
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-[var(--oldflick-gold)]">
                      <FileText className="w-5 h-5" />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                  )}
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
                  onClick={handleUpload}
                  disabled={!file}
                  className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Enrich
                </Button>
              </div>
            </>
          )}

          {isUploading && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-[var(--oldflick-gold)] animate-spin" />
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-white font-medium">{status}</p>
              <p className="text-center text-gray-400 text-sm">{progress}% complete</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Check className="w-16 h-16 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Upload Complete!</h3>
                <p className="text-gray-400">
                  Successfully created and enriched {results.successCount} of {results.total} items
                </p>
                {results.errorCount > 0 && (
                  <p className="text-red-400 text-sm mt-2">
                    {results.errorCount} items failed to import
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