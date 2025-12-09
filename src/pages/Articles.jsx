import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { BookOpen, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Articles() {
  const [user, setUser] = useState(null);

  // Query articles from backend (will be connected to Notion later)
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      try {
        return await apiClient.request('/articles');
      } catch (error) {
        console.log('Articles not yet connected');
        return [];
      }
    },
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log("User not logged in");
    }
  };

  return (
    <div className="min-h-screen oldflick-gradient">
      {/* Header Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--oldflick-gold)] to-yellow-600 rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Articles & Insights
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore film essays, behind-the-scenes stories, and classic cinema insights
            </p>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-gold)]"></div>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="bg-gray-900 border-[var(--oldflick-gold)]/20 hover:border-[var(--oldflick-gold)]/50 transition-colors overflow-hidden">
                  {article.cover_image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {article.excerpt && (
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    {article.published_date && (
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(article.published_date).toLocaleDateString()}
                      </div>
                    )}
                    {article.author && (
                      <p className="text-gray-400 text-xs">
                        By <span className="text-[var(--oldflick-gold)]">{article.author}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">No Articles Yet</h3>
              <p className="text-gray-500">
                Articles will appear here once Notion integration is connected.
              </p>
              <p className="text-gray-500 text-sm mt-4">
                To set up: Add your Notion database ID in environment variables and restart.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
