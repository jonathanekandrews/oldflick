import React, { useState } from 'react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkImport() {
  const [importing, setImporting] = useState(false);
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    title: '',
    description: '',
    type: 'film',
    year: '',
    duration: '',
    video_url: '',
    thumbnail_url: '',
    backdrop_url: '',
    genre: [],
    rating: 'NR',
    imdb_rating: '',
    director: '',
    cast_members: [],
    is_featured: false,
    is_masterpiece: false,
    is_cult: false
  });

  const supabaseBaseUrl = 'https://oodvbtxbeoxpilrzbxmg.supabase.co/storage/v1/object/public';

  const handleAddItem = () => {
    if (!currentItem.title || !currentItem.video_url) {
      toast.error('Title and Video URL are required');
      return;
    }
    setItems([...items, { ...currentItem, id: Date.now() }]);
    setCurrentItem({
      title: '',
      description: '',
      type: 'film',
      year: '',
      duration: '',
      video_url: '',
      thumbnail_url: '',
      backdrop_url: '',
      genre: [],
      rating: 'NR',
      imdb_rating: '',
      director: '',
      cast_members: [],
      is_featured: false,
      is_masterpiece: false,
      is_cult: false
    });
    toast.success('Added to import queue');
    setShowForm(false);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleBulkImport = async () => {
    if (items.length === 0) {
      toast.error('No items to import');
      return;
    }

    setImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      try {
        const payload = {
          ...item,
          year: item.year ? parseInt(item.year) : null,
          imdb_rating: item.imdb_rating ? parseFloat(item.imdb_rating) : null,
          genre: typeof item.genre === 'string' ? item.genre.split(',').map(g => g.trim()) : item.genre,
          cast_members: typeof item.cast_members === 'string' ? item.cast_members.split(',').map(c => c.trim()) : item.cast_members
        };
        
        await apiClient.content.create(payload);
        successCount++;
      } catch (error) {
        console.error('Failed to import:', item.title, error);
        failCount++;
      }
    }

    setImporting(false);
    
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} item${successCount > 1 ? 's' : ''}`);
      setItems([]);
    }
    
    if (failCount > 0) {
      toast.error(`Failed to import ${failCount} item${failCount > 1 ? 's' : ''}`);
    }
  };

  const parseCSVValue = (header, value) => {
    if (!value) return '';
    
    if (header === 'is_featured' || header === 'is_masterpiece' || header === 'is_cult') {
      return value.toLowerCase() === 'true';
    }
    
    if (header === 'genre' || header === 'cast_members') {
      return value.split(';').map(v => v.trim()).filter(Boolean);
    }
    
    if (header === 'year') {
      return value ? parseInt(value) : '';
    }
    
    if (header === 'imdb_rating') {
      return value ? parseFloat(value) : '';
    }
    
    return value;
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const newItems = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          const item = { id: Date.now() + i };
          
          headers.forEach((header, index) => {
            item[header] = parseCSVValue(header, values[index] || '');
          });
          
          newItems.push(item);
        }
        
        setItems([...items, ...newItems]);
        toast.success(`Loaded ${newItems.length} items from CSV`);
      } catch (error) {
        toast.error('Failed to parse CSV file');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `title,description,type,year,duration,video_url,thumbnail_url,backdrop_url,genre,rating,imdb_rating,director,cast_members,is_featured,is_masterpiece,is_cult
Nosferatu,A vampire terrorizes a town.,film,1922,94 min,${supabaseBaseUrl}/oldflick-videos/film_masterpieces_video/Nosferatu.mp4,${supabaseBaseUrl}/oldflick-videos/film_masterpieces_images/nosferatu_poster_01.jpg,,Horror;Silent,NR,7.9,F.W. Murnau,Max Schreck,false,true,false`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oldflick_import_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Bulk Content Import</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('csv-upload').click()}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
              <Button
                onClick={() => setShowForm(!showForm)}
                size="sm"
                className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Single Item
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleCSVImport}
            className="hidden"
          />

          {showForm && (
            <div className="space-y-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="e.g., Nosferatu"
                  />
                </div>
                <div>
                  <Label className="text-white">Type</Label>
                  <Select value={currentItem.type} onValueChange={(value) => setCurrentItem({ ...currentItem, type: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="tv">TV Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Year</Label>
                  <Input
                    type="number"
                    value={currentItem.year}
                    onChange={(e) => setCurrentItem({ ...currentItem, year: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="1922"
                  />
                </div>
                <div>
                  <Label className="text-white">Duration</Label>
                  <Input
                    value={currentItem.duration}
                    onChange={(e) => setCurrentItem({ ...currentItem, duration: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="94 min"
                  />
                </div>
                <div>
                  <Label className="text-white">IMDB Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentItem.imdb_rating}
                    onChange={(e) => setCurrentItem({ ...currentItem, imdb_rating: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="7.9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Video URL * (Supabase)</Label>
                <Input
                  value={currentItem.video_url}
                  onChange={(e) => setCurrentItem({ ...currentItem, video_url: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={`${supabaseBaseUrl}/oldflick-videos/film_masterpieces_video/filename.mp4`}
                />
              </div>

              <div>
                <Label className="text-white">Thumbnail URL (Poster)</Label>
                <Input
                  value={currentItem.thumbnail_url}
                  onChange={(e) => setCurrentItem({ ...currentItem, thumbnail_url: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={`${supabaseBaseUrl}/oldflick-videos/film_masterpieces_images/poster.jpg`}
                />
              </div>

              <div>
                <Label className="text-white">Backdrop URL</Label>
                <Input
                  value={currentItem.backdrop_url}
                  onChange={(e) => setCurrentItem({ ...currentItem, backdrop_url: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={`${supabaseBaseUrl}/oldflick-videos/backdrops/backdrop.jpg`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Director</Label>
                  <Input
                    value={currentItem.director}
                    onChange={(e) => setCurrentItem({ ...currentItem, director: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="F.W. Murnau"
                  />
                </div>
                <div>
                  <Label className="text-white">Rating</Label>
                  <Select value={currentItem.rating} onValueChange={(value) => setCurrentItem({ ...currentItem, rating: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NR">NR (Not Rated)</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="PG-13">PG-13</SelectItem>
                      <SelectItem value="R">R</SelectItem>
                      <SelectItem value="NC-17">NC-17</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Genre (comma-separated)</Label>
                  <Input
                    value={currentItem.genre}
                    onChange={(e) => setCurrentItem({ ...currentItem, genre: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Horror, Silent"
                  />
                </div>
                <div>
                  <Label className="text-white">Cast Members (comma-separated)</Label>
                  <Input
                    value={currentItem.cast_members}
                    onChange={(e) => setCurrentItem({ ...currentItem, cast_members: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Max Schreck, Gustav von Wangenheim"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Content Flags</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentItem.is_featured}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10"
                    />
                    <span className="text-white text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentItem.is_masterpiece}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_masterpiece: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10"
                    />
                    <span className="text-white text-sm">Masterpiece</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentItem.is_cult}
                      onChange={(e) => setCurrentItem({ ...currentItem, is_cult: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10"
                    />
                    <span className="text-white text-sm">Cult Classic</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddItem}
                  className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Queue
                </Button>
              </div>
            </div>
          )}

          {items.length > 0 ? (
            <>
              <div className="space-y-2 mb-4">
                <p className="text-white text-sm">
                  {items.length} item{items.length > 1 ? 's' : ''} ready to import
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-gray-400 text-sm">
                          {item.type === 'film' ? 'Film' : 'TV Show'} • {item.year || 'No year'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleBulkImport}
                disabled={importing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Import {items.length} Item{items.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items queued for import</p>
              <p className="text-sm mt-1">Add items manually or upload a CSV file</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Supabase URL Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-gray-400 text-sm">Films (oldflick-videos)</Label>
            <code className="block mt-1 p-2 bg-black/30 rounded text-xs text-green-400 overflow-x-auto">
              {supabaseBaseUrl}/oldflick-videos/film_masterpieces_video/[filename].mp4
            </code>
          </div>
          <div>
            <Label className="text-gray-400 text-sm">TV Shows (oldflick-television)</Label>
            <code className="block mt-1 p-2 bg-black/30 rounded text-xs text-green-400 overflow-x-auto">
              {supabaseBaseUrl}/oldflick-television/[filename].mp4
            </code>
          </div>
          <div>
            <Label className="text-gray-400 text-sm">Posters (film_masterpieces_images)</Label>
            <code className="block mt-1 p-2 bg-black/30 rounded text-xs text-green-400 overflow-x-auto">
              {supabaseBaseUrl}/oldflick-videos/film_masterpieces_images/[filename].jpg
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
