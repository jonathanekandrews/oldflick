
import React, { useState, useEffect } from "react";
import { apiClient as base44 } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Trash2, Eye, EyeOff, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const { data: allContent = [] } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.content.list(),
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setHistoryEnabled(currentUser.history_enabled !== false);
    } catch (error) {
      base44.auth.redirectToLogin(createPageUrl("Admin"));
    }
  };

  const toggleHistoryEnabled = async () => {
    const newValue = !historyEnabled;
    await base44.auth.updateMe({ history_enabled: newValue });
    setHistoryEnabled(newValue);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const validHistory = watchHistory.filter(h => h && h.content_id);
      setSelectedItems(validHistory.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Delete ${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} from watch history?`)) {
      const validHistory = watchHistory.filter(h => h && h.content_id);
      const newHistory = validHistory.filter((_, index) => !selectedItems.includes(index));
      await base44.auth.updateMe({ watch_history: newHistory });
      await loadUser();
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all watch history? This cannot be undone.")) {
      await base44.auth.updateMe({ watch_history: [] });
      await loadUser();
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const getContentById = (contentId) => {
    if (!contentId) return null;
    return allContent.find(c => c.id === contentId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  const watchHistory = (user.watch_history || []).filter(h => h && h.content_id);

  return (
    <div className="min-h-screen oldflick-gradient py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Watch History
          </h1>
          <p className="text-gray-400">
            View and manage your viewing activity
          </p>
        </div>

        {/* Privacy Controls */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {historyEnabled ? <Eye className="w-5 h-5 text-green-500" /> : <EyeOff className="w-5 h-5 text-red-500" />}
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="history-toggle" className="text-white font-medium">
                  Enable Watch History
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  {historyEnabled 
                    ? "Your viewing activity is being tracked" 
                    : "Watch history tracking is disabled"}
                </p>
              </div>
              <Switch
                id="history-toggle"
                checked={historyEnabled}
                onCheckedChange={toggleHistoryEnabled}
                className={`${
                  historyEnabled 
                    ? "data-[state=checked]:bg-green-500" 
                    : "bg-red-500/50"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        {/* History Management */}
        {watchHistory.length > 0 && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Your Activity ({watchHistory.length} items)
                </CardTitle>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    {selectAll ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                    {selectAll ? "Deselect All" : "Select All"}
                  </Button>
                  {selectedItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSelected}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedItems.length})
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {watchHistory.map((item, index) => {
                  const content = getContentById(item.content_id);
                  const isSelected = selectedItems.includes(index);
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                        isSelected ? "bg-[var(--oldflick-burgundy)]/20 border border-[var(--oldflick-burgundy)]" : "bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={() => handleSelectItem(index)}
                    >
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[var(--oldflick-gold)]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      {content ? (
                        <>
                          <img
                            src={content.thumbnail_url || content.poster_url}
                            alt={content.title}
                            className="w-16 h-24 object-cover rounded flex-shrink-0 bg-gradient-to-br from-gray-800 to-black"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white mb-1 truncate">
                              {content.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Watched {format(new Date(item.watched_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                            {item.progress > 0 && (
                              <div className="mt-2">
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[var(--oldflick-burgundy)]"
                                    style={{ width: `${Math.min(100, (item.progress / 7200) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(createPageUrl(`Watch?id=${content.id}`));
                            }}
                            className="border-white/30 text-white hover:bg-white/10 flex-shrink-0"
                          >
                            Watch Again
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1">
                          <p className="text-gray-400">Content no longer available</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(item.watched_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {watchHistory.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-20 text-center">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No watch history yet</p>
              <p className="text-gray-500 text-sm mb-6">
                {historyEnabled 
                  ? "Start watching content to see your history here" 
                  : "Enable watch history to track your viewing activity"}
              </p>
              <Button
                onClick={() => navigate(createPageUrl("Browse"))}
                className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
              >
                Browse Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
