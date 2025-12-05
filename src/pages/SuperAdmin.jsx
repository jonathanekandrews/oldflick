
import React, { useState, useEffect } from "react";
import { apiClient as base44 } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Film, Tv, Sparkles, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentForm from "../components/admin/ContentForm";
import ContentTable from "../components/admin/ContentTable";
import AIEnrichmentPanel from "../components/superadmin/AIEnrichmentPanel";
import BulkUploadModal from "../components/superadmin/BulkUploadModal";
import BulkURLUpdateModal from "../components/superadmin/BulkURLUpdateModal";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [enrichingContent, setEnrichingContent] = useState(null);
  const [showBulkURLUpdate, setShowBulkURLUpdate] = useState(false);
  
  const formRef = React.useRef(null);

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.Content.findMany(),
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Scroll to form when it opens
  useEffect(() => {
    if ((showForm || enrichingContent) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, enrichingContent]);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      base44.auth.redirectToLogin(createPageUrl("SuperAdmin"));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setShowForm(false);
      setEditingContent(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Content.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setShowForm(false);
      setEditingContent(null);
      setEnrichingContent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Content.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (content) => {
    // Close enrichment panel if open
    setEnrichingContent(null);
    // Set editing state
    setEditingContent(content);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContent(null);
    setEnrichingContent(null);
  };

  const handleEnrich = (content) => {
    // Close edit form if open
    setShowForm(false);
    setEditingContent(null);
    // Open enrichment
    setEnrichingContent(content);
  };

  const handleEnrichmentComplete = (enrichedData) => {
    updateMutation.mutate({
      id: enrichingContent.id,
      data: {
        ...enrichingContent,
        ...enrichedData,
        ai_enriched: true,
        ai_enriched_date: new Date().toISOString()
      }
    });
  };

  const stats = {
    total: allContent.length,
    movies: allContent.filter(c => c.type === "movie").length,
    tvShows: allContent.filter(c => c.type === "tv_show").length,
    enriched: allContent.filter(c => c.ai_enriched).length,
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center oldflick-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--oldflick-burgundy)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oldflick-gradient py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[var(--oldflick-gold)]" />
              Super Admin Portal
            </h1>
            <p className="text-gray-400">
              AI-powered content management & enrichment system
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowBulkURLUpdate(true)}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Bulk URL Update
            </Button>
            <Button
              onClick={() => setShowBulkUpload(true)}
              variant="outline"
              className="border-[var(--oldflick-gold)] text-[var(--oldflick-gold)] hover:bg-[var(--oldflick-gold)]/10"
            >
              <Upload className="w-5 h-5 mr-2" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => {
                setEditingContent(null);
                setEnrichingContent(null);
                setShowForm(true);
              }}
              className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Content
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[var(--oldflick-gold)]" />
                Total Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-500" />
                Movies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.movies}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-purple-500" />
                TV Shows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.tvShows}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--oldflick-gold)]" />
                AI Enriched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.enriched}</p>
              <p className="text-sm text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.enriched / stats.total) * 100) : 0}% coverage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Enrichment Panel */}
        {enrichingContent && (
          <div ref={formRef} className="mb-8 scroll-mt-24">
            <AIEnrichmentPanel
              content={enrichingContent}
              onComplete={handleEnrichmentComplete}
              onCancel={() => setEnrichingContent(null)}
            />
          </div>
        )}

        {/* Content Form */}
        {showForm && (
          <div ref={formRef} className="mb-8 scroll-mt-24">
            <ContentForm
              content={editingContent}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => setShowBulkUpload(false)}
            onComplete={() => {
              setShowBulkUpload(false);
              queryClient.invalidateQueries({ queryKey: ['content'] });
            }}
          />
        )}

        {/* Bulk URL Update Modal */}
        {showBulkURLUpdate && (
          <BulkURLUpdateModal
            content={allContent}
            onClose={() => setShowBulkURLUpdate(false)}
            onComplete={() => {
              setShowBulkURLUpdate(false);
              queryClient.invalidateQueries({ queryKey: ['content'] });
            }}
          />
        )}

        {/* Content Table */}
        <ContentTable
          content={allContent}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEnrich={handleEnrich}
          isDeleting={deleteMutation.isPending}
          showEnrichButton={true}
        />
      </div>
    </div>
  );
}
