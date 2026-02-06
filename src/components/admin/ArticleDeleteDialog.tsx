import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';

type Article = Tables<'articles'>;

interface ArticleDeleteDialogProps {
  article: Article | null;
  bulkCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ArticleDeleteDialog = ({
  article,
  bulkCount,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: ArticleDeleteDialogProps) => {
  const isBulkDelete = bulkCount !== undefined && bulkCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-black">
            {isBulkDelete ? `Delete ${bulkCount} Articles` : 'Delete Article'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulkDelete ? (
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">
                  {bulkCount} articles
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">
                  "{article?.title}"
                </span>
                ? This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-2 border-black">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-black"
          >
            {isLoading ? 'Deleting...' : isBulkDelete ? `Delete ${bulkCount} Articles` : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
