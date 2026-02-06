import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { ArticleEditDialog } from './ArticleEditDialog';
import { ArticleDeleteDialog } from './ArticleDeleteDialog';
import type { Tables } from '@/integrations/supabase/types';

type Article = Tables<'articles'>;

export const ArticleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Article deleted successfully');
      setDeletingArticle(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete article: ${error.message}`);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (articleIds: string[]) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .in('id', articleIds);
      if (error) throw error;
    },
    onSuccess: (_, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success(`${deletedIds.length} articles deleted successfully`);
      setSelectedIds(new Set());
      setShowBulkDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete articles: ${error.message}`);
    },
  });

  const toggleSelectAll = () => {
    if (!articles) return;
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      topic?: string;
      status?: Article['status'];
      content_category?: Article['content_category'];
      is_featured?: boolean;
      image_url?: string;
      published_at?: string;
      analysis?: string;
      key_points?: string[];
      takeaways?: string[];
    }) => {
      // Update article fields
      const articleUpdate: Record<string, unknown> = {};
      if (data.title !== undefined) articleUpdate.title = data.title;
      if (data.topic !== undefined) articleUpdate.topic = data.topic;
      if (data.status !== undefined) articleUpdate.status = data.status;
      if (data.content_category !== undefined) articleUpdate.content_category = data.content_category;
      if (data.is_featured !== undefined) articleUpdate.is_featured = data.is_featured;
      if (data.image_url !== undefined) articleUpdate.image_url = data.image_url;
      if (data.published_at !== undefined) articleUpdate.published_at = data.published_at;

      if (Object.keys(articleUpdate).length > 0) {
        const { error: articleError } = await supabase
          .from('articles')
          .update(articleUpdate)
          .eq('id', data.id);
        if (articleError) throw articleError;
      }

      // Update or insert summary fields if provided
      if (data.analysis !== undefined || data.key_points !== undefined || data.takeaways !== undefined) {
        const summaryUpdate: Record<string, unknown> = {};
        if (data.analysis !== undefined) summaryUpdate.analysis = data.analysis;
        if (data.key_points !== undefined) summaryUpdate.key_points = data.key_points;
        if (data.takeaways !== undefined) summaryUpdate.takeaways = data.takeaways;

        // Check if summary exists
        const { data: existingSummary } = await supabase
          .from('summaries')
          .select('id')
          .eq('article_id', data.id)
          .maybeSingle();

        if (existingSummary) {
          // Update existing summary
          const { error: summaryError } = await supabase
            .from('summaries')
            .update(summaryUpdate)
            .eq('article_id', data.id);
          if (summaryError) throw summaryError;
        } else {
          // Insert new summary
          const { error: summaryError } = await supabase
            .from('summaries')
            .insert({
              article_id: data.id,
              ...summaryUpdate,
            });
          if (summaryError) throw summaryError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['article-summary'] });
      toast.success('Article updated successfully');
      setEditingArticle(null);
    },
    onError: (error) => {
      toast.error(`Failed to update article: ${error.message}`);
    },
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="border-b-2 border-black">
        <CardTitle className="font-black">Article Management</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Search Bar & Bulk Actions */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black"
            />
          </div>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              className="border-2 border-black"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedIds.size} Selected
            </Button>
          )}
        </div>

        {/* Articles Table */}
        <div className="border-2 border-black overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-10">
                  <Checkbox
                    checked={articles && articles.length > 0 && selectedIds.size === articles.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="font-bold">Title</TableHead>
                <TableHead className="font-bold w-24">Status</TableHead>
                <TableHead className="font-bold w-24">Category</TableHead>
                <TableHead className="font-bold w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : articles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No articles found matching your search' : 'No articles yet'}
                  </TableCell>
                </TableRow>
              ) : (
                articles?.map((article) => (
                  <TableRow key={article.id} className={selectedIds.has(article.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(article.id)}
                        onCheckedChange={() => toggleSelect(article.id)}
                        aria-label={`Select ${article.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium line-clamp-1">{article.title}</span>
                        <a
                          href={article.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(article.status)} text-white border-0`}>
                        {article.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {article.content_category || article.topic || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-2 border-black"
                          onClick={() => setEditingArticle(article)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-2 border-black text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setDeletingArticle(article)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <ArticleEditDialog
          article={editingArticle}
          open={!!editingArticle}
          onOpenChange={(open) => !open && setEditingArticle(null)}
          onSave={(updates) => updateMutation.mutate(updates)}
          isLoading={updateMutation.isPending}
        />

        {/* Single Delete Dialog */}
        <ArticleDeleteDialog
          article={deletingArticle}
          open={!!deletingArticle}
          onOpenChange={(open) => !open && setDeletingArticle(null)}
          onConfirm={() => deletingArticle && deleteMutation.mutate(deletingArticle.id)}
          isLoading={deleteMutation.isPending}
        />

        {/* Bulk Delete Dialog */}
        <ArticleDeleteDialog
          article={null}
          bulkCount={selectedIds.size}
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
          onConfirm={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
          isLoading={bulkDeleteMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};
