import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Article = Tables<'articles'>;
type Summary = Tables<'summaries'>;

export interface ArticleEditData {
  id: string;
  title?: string;
  status?: Article['status'];
  content_category?: Article['content_category'];
  topic?: string;
  is_featured?: boolean;
  image_url?: string;
  published_at?: string;
  // Summary fields
  analysis?: string;
  key_points?: string[];
  takeaways?: string[];
}

interface ArticleEditDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: ArticleEditData) => void;
  isLoading: boolean;
}

const STATUSES = ['pending', 'processing', 'published', 'failed', 'archived'] as const;
const CATEGORIES = ['tech', 'video_games', 'finance', 'politics', 'climate'] as const;

export const ArticleEditDialog = ({
  article,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: ArticleEditDialogProps) => {
  // Article fields
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [category, setCategory] = useState<string>('tech');
  const [topic, setTopic] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  
  // Summary fields
  const [analysis, setAnalysis] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [takeaways, setTakeaways] = useState<string[]>([]);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // Fetch summary data for the article
  const { data: summary } = useQuery({
    queryKey: ['article-summary', article?.id],
    queryFn: async () => {
      if (!article?.id) return null;
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('article_id', article.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!article?.id && open,
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setStatus(article.status || 'pending');
      setCategory(article.content_category || 'tech');
      setTopic(article.topic || '');
      setIsFeatured(article.is_featured || false);
      setImageUrl(article.image_url || '');
      // Format date for datetime-local input
      setPublishedAt(article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '');
    }
  }, [article]);

  useEffect(() => {
    if (summary) {
      setAnalysis(summary.analysis || '');
      setKeyPoints(Array.isArray(summary.key_points) ? (summary.key_points as string[]) : []);
      setTakeaways(Array.isArray(summary.takeaways) ? (summary.takeaways as string[]) : []);
    } else {
      setAnalysis('');
      setKeyPoints([]);
      setTakeaways([]);
    }
  }, [summary]);

  const handleSave = () => {
    if (!article) return;
    onSave({
      id: article.id,
      title,
      status: status as Article['status'],
      content_category: category as Article['content_category'],
      topic,
      is_featured: isFeatured,
      image_url: imageUrl || undefined,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      analysis,
      key_points: keyPoints,
      takeaways,
    });
  };

  const addKeyPoint = () => setKeyPoints([...keyPoints, '']);
  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...keyPoints];
    updated[index] = value;
    setKeyPoints(updated);
  };
  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const addTakeaway = () => setTakeaways([...takeaways, '']);
  const updateTakeaway = (index: number, value: string) => {
    const updated = [...takeaways];
    updated[index] = value;
    setTakeaways(updated);
  };
  const removeTakeaway = (index: number) => {
    setTakeaways(takeaways.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${article?.id || 'new'}-${Date.now()}.${fileExt}`;
      const filePath = `featured/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-black">Edit Article</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media & Time</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-2 border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="font-bold">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="border-2 border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-bold">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-2 border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic" className="font-bold">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI, Elections, Markets"
                className="border-2 border-black"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured" className="font-bold">Featured Article</Label>
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>
          </TabsContent>

          {/* Content Tab - Analysis, Key Points, Takeaways */}
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analysis" className="font-bold">Analysis</Label>
              <Textarea
                id="analysis"
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                placeholder="Detailed analysis of the article..."
                className="border-2 border-black min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold">Key Points</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addKeyPoint}
                  className="border-2 border-black h-7 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {keyPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={point}
                      onChange={(e) => updateKeyPoint(index, e.target.value)}
                      placeholder={`Key point ${index + 1}`}
                      className="border-2 border-black"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeKeyPoint(index)}
                      className="border-2 border-black h-10 w-10 p-0 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {keyPoints.length === 0 && (
                  <p className="text-sm text-muted-foreground">No key points yet. Click "Add" to create one.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold">Takeaways</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addTakeaway}
                  className="border-2 border-black h-7 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {takeaways.map((takeaway, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={takeaway}
                      onChange={(e) => updateTakeaway(index, e.target.value)}
                      placeholder={`Takeaway ${index + 1}`}
                      className="border-2 border-black"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeTakeaway(index)}
                      className="border-2 border-black h-10 w-10 p-0 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {takeaways.length === 0 && (
                  <p className="text-sm text-muted-foreground">No takeaways yet. Click "Add" to create one.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Media & Time Tab */}
          <TabsContent value="media" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="font-bold">Featured Image</Label>
              
              {/* Upload Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-black w-full sm:w-auto"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <span className="text-xs text-muted-foreground self-center">
                  or enter URL below
                </span>
              </div>
              
              {/* URL Input */}
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="border-2 border-black"
              />
              
              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-2 border-2 border-black p-2 relative">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-40 w-auto object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 h-6 w-6 p-0 border-2 border-black bg-background"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt" className="font-bold">Published Date & Time</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="border-2 border-black"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 border-black"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="border-2 border-black"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
