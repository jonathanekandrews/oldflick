import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BulkImport from '@/components/admin/BulkImport';
import { Upload, List, BarChart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ContentManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: allContent = [], refetch } = useQuery({
    queryKey: ['content'],
    queryFn: () => apiClient.entities.content.list(),
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
      
      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/Login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null;
  }

  const filmCount = allContent.filter(c => c.content_type === 'film').length;
  const tvCount = allContent.filter(c => c.content_type === 'tv').length;

  return (
    <div className="min-h-screen oldflick-gradient py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Content Management
          </h1>
          <p className="text-gray-400">
            Manage your Oldflick video library
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Content</p>
                  <p className="text-3xl font-bold text-white mt-1">{allContent.length}</p>
                </div>
                <BarChart className="w-10 h-10 text-[var(--oldflick-gold)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Films</p>
                  <p className="text-3xl font-bold text-white mt-1">{filmCount}</p>
                </div>
                <div className="w-10 h-10 bg-[var(--oldflick-burgundy)]/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎬</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">TV Shows</p>
                  <p className="text-3xl font-bold text-white mt-1">{tvCount}</p>
                </div>
                <div className="w-10 h-10 bg-[var(--oldflick-burgundy)]/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">📺</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="import" className="data-[state=active]:bg-[var(--oldflick-burgundy)]">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-[var(--oldflick-burgundy)]">
              <List className="w-4 h-4 mr-2" />
              Content List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <BulkImport />
          </TabsContent>

          <TabsContent value="list">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">All Content ({allContent.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {allContent.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No content yet</p>
                    <p className="text-sm mt-2">Use the Bulk Import tab to add videos</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {allContent.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {item.thumbnail_url && (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-20 h-28 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-2">
                            <span className="bg-[var(--oldflick-burgundy)]/20 px-2 py-0.5 rounded">
                              {item.type === 'film' ? '🎬 Film' : '📺 TV'}
                            </span>
                            {item.year && <span>{item.year}</span>}
                            {item.duration && <span>• {item.duration}</span>}
                            {item.imdb_rating && <span>• ⭐ {item.imdb_rating}</span>}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                          )}
                          {item.genre && item.genre.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.genre.map((g, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 bg-white/5 rounded-full text-gray-300"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
