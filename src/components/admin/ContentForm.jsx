
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const GENRES = [
  "Comedy", "Crime & Mystery", "Drama", "Horror", "Musical", 
  "Romance", "Sci-Fi", "Thriller", "War", "Western"
];

export default function ContentForm({ content, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(content || {
    title: "",
    description: "",
    content_type: "film",
    release_year: new Date().getFullYear(),
    runtime_minutes: "",
    poster_url: "",
    video_url: "",
    genre: "",
    rating: "",
    actors: [],
    director: "",
  });

  const [newCast, setNewCast] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCast = () => {
    if (newCast.trim()) {
      handleChange("cast", [...(formData.cast || []), newCast.trim()]);
      setNewCast("");
    }
  };

  const removeCast = (index) => {
    handleChange("cast", formData.cast.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">
          {content ? "Edit Content" : "Add New Content"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Type *</Label>
              <Select value={formData.content_type} onValueChange={(value) => handleChange("content_type", value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="film">Film</SelectItem>
                  <SelectItem value="tv">TV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_year" className="text-white">Release Year</Label>
              <Input
                id="release_year"
                type="number"
                value={formData.release_year}
                onChange={(e) => handleChange("release_year", parseInt(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="runtime_minutes" className="text-white">Runtime (minutes)</Label>
              <Input
                id="runtime_minutes"
                type="number"
                placeholder="e.g., 120"
                value={formData.runtime_minutes}
                onChange={(e) => handleChange("runtime_minutes", parseInt(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className="text-white">Rating (IMDb style, 0-10)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => handleChange("rating", parseFloat(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="director" className="text-white">Director</Label>
              <Input
                id="director"
                value={formData.director}
                onChange={(e) => handleChange("director", e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Featured</Label>
              <Select 
                value={formData.is_featured ? "yes" : "no"} 
                onValueChange={(value) => handleChange("is_featured", value === "yes")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Masterpiece</Label>
              <Select 
                value={formData.is_masterpiece ? "yes" : "no"} 
                onValueChange={(value) => handleChange("is_masterpiece", value === "yes")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Cult Classic</Label>
              <Select 
                value={formData.is_cult ? "yes" : "no"} 
                onValueChange={(value) => handleChange("is_cult", value === "yes")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url" className="text-white">Video URL (MP4) *</Label>
            <Input
              id="video_url"
              type="url"
              placeholder="https://your-storage.supabase.co/video.mp4"
              value={formData.video_url}
              onChange={(e) => handleChange("video_url", e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white"
            />
            <p className="text-xs text-gray-400">Upload your MP4 video file and paste the URL here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poster_url" className="text-white">Poster URL</Label>
              <Input
                id="poster_url"
                type="url"
                placeholder="https://..."
                value={formData.poster_url}
                onChange={(e) => handleChange("poster_url", e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-white">Primary Genre *</Label>
            <Select value={formData.genre} onValueChange={(value) => handleChange("genre", value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select genre..." />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Cast</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.cast?.map((actor, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 text-white rounded-full text-sm flex items-center gap-2"
                >
                  {actor}
                  <button
                    type="button"
                    onClick={() => removeCast(index)}
                    className="hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCast}
                onChange={(e) => setNewCast(e.target.value)}
                placeholder="Actor name"
                className="bg-white/10 border-white/20 text-white"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCast();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addCast}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
            >
              {isSubmitting ? "Saving..." : content ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
