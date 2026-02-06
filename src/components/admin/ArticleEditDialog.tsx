import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Tables } from '@/integrations/supabase/types';

type Article = Tables<'articles'>;

interface ArticleEditDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Article> & { id: string }) => void;
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
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [category, setCategory] = useState<string>('tech');
  const [topic, setTopic] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setStatus(article.status || 'pending');
      setCategory(article.content_category || 'tech');
      setTopic(article.topic || '');
      setIsFeatured(article.is_featured || false);
    }
  }, [article]);

  const handleSave = () => {
    if (!article) return;
    onSave({
      id: article.id,
      title,
      status: status as Article['status'],
      content_category: category as Article['content_category'],
      topic,
      is_featured: isFeatured,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="font-black">Edit Article</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                      {c}
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
              placeholder="e.g., AI, Crypto, Elections"
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
        </div>

        <DialogFooter>
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
