 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { useSources, type Source } from '@/hooks/useSources';
 import { AdminNav } from '@/components/admin/AdminNav';
 import { SourceDialog } from '@/components/admin/SourceDialog';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Switch } from '@/components/ui/switch';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
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
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { 
   Plus, 
   MoreHorizontal, 
   Pencil, 
   Trash2, 
   RefreshCw,
   ExternalLink,
   Copy,
   Database
 } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { toast } from '@/hooks/use-toast';
 import { supabase } from '@/integrations/supabase/client';
 
 const PRIORITY_COLORS: Record<string, string> = {
   critical: 'bg-destructive text-destructive-foreground',
   high: 'bg-primary text-primary-foreground',
   medium: 'bg-secondary text-secondary-foreground',
   low: 'bg-muted text-muted-foreground',
 };
 
 const Sources = () => {
   const navigate = useNavigate();
   const { user, profile, loading: authLoading, signOut } = useAuth();
   const {
     sources,
     isLoading,
     create,
     update,
     remove,
     toggleActive,
     isCreating,
     isUpdating,
     isDeleting,
   } = useSources();
 
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingSource, setEditingSource] = useState<Source | null>(null);
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);
   const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate('/admin/login');
     }
   }, [user, authLoading, navigate]);
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/admin/login');
   };
 
   const handleAddSource = () => {
     setEditingSource(null);
     setDialogOpen(true);
   };
 
   const handleEditSource = (source: Source) => {
     setEditingSource(source);
     setDialogOpen(true);
   };
 
   const handleDeleteClick = (source: Source) => {
     setSourceToDelete(source);
     setDeleteConfirmOpen(true);
   };
 
   const handleConfirmDelete = () => {
     if (sourceToDelete) {
       remove(sourceToDelete.id);
       setDeleteConfirmOpen(false);
       setSourceToDelete(null);
     }
   };
 
   const handleDialogSubmit = (data: any) => {
     if (editingSource) {
       update(data, {
         onSuccess: () => setDialogOpen(false),
       });
     } else {
       create(data, {
         onSuccess: () => setDialogOpen(false),
       });
     }
   };
 
   const handleScrapeSource = async (source: Source) => {
     setScrapingSourceId(source.id);
     try {
       const { data, error } = await supabase.functions.invoke('scrape-news', {
         body: { sourceId: source.id },
       });
 
       if (error) throw error;
 
       toast({
         title: 'Scrape Complete',
         description: `Found ${data?.totalArticles || 0} articles from ${source.name}.`,
       });
     } catch (error: any) {
       toast({
         title: 'Scrape Failed',
         description: error.message || 'Failed to scrape source',
         variant: 'destructive',
       });
     } finally {
       setScrapingSourceId(null);
     }
   };
 
   const copyToClipboard = (text: string) => {
     navigator.clipboard.writeText(text);
     toast({
       title: 'Copied',
       description: 'URL copied to clipboard',
     });
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
       </div>
     );
   }
 
   if (!user) {
     return null;
   }
 
   return (
     <div className="min-h-screen bg-background">
       <AdminNav
         displayName={profile?.display_name}
         email={user.email}
         onSignOut={handleSignOut}
       />
 
       <main className="container mx-auto px-4 py-8">
         <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-black">
               <Database className="w-6 h-6 text-primary-foreground" />
             </div>
             <div>
               <h1 className="font-black text-2xl">Sources</h1>
               <p className="text-muted-foreground">Manage news sources and RSS feeds</p>
             </div>
           </div>
           <Button
             onClick={handleAddSource}
             className="border-2 border-black font-bold"
           >
             <Plus className="w-4 h-4 mr-2" />
             Add Source
           </Button>
         </div>
 
         <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <CardHeader className="border-b-2 border-black">
             <CardTitle className="font-black">All Sources ({sources.length})</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
             {isLoading ? (
               <div className="p-4 space-y-3">
                 {[...Array(5)].map((_, i) => (
                   <Skeleton key={i} className="h-16 w-full" />
                 ))}
               </div>
             ) : sources.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground">
                 <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                 <p className="font-medium">No sources yet</p>
                 <p className="text-sm">Add your first news source to get started.</p>
               </div>
             ) : (
               <Table>
                 <TableHeader>
                   <TableRow className="border-b-2 border-black">
                     <TableHead className="font-bold">Name</TableHead>
                     <TableHead className="font-bold">RSS URL</TableHead>
                     <TableHead className="font-bold">Priority</TableHead>
                     <TableHead className="font-bold">Active</TableHead>
                     <TableHead className="font-bold">Last Scrape</TableHead>
                     <TableHead className="font-bold w-[80px]">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {sources.map((source) => (
                     <TableRow key={source.id} className="border-b border-border">
                       <TableCell>
                         <div className="flex flex-col">
                           <span className="font-semibold">{source.name}</span>
                           {source.website_url && (
                             <a
                               href={source.website_url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                             >
                               {new URL(source.website_url).hostname}
                               <ExternalLink className="w-3 h-3" />
                             </a>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2 max-w-[200px]">
                           <span className="truncate text-sm text-muted-foreground">
                             {source.rss_url}
                           </span>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6"
                             onClick={() => copyToClipboard(source.rss_url || '')}
                           >
                             <Copy className="w-3 h-3" />
                           </Button>
                         </div>
                       </TableCell>
                       <TableCell>
                         <Badge
                           className={`${PRIORITY_COLORS[source.priority || 'medium']} border-2 border-black font-bold uppercase text-xs`}
                         >
                           {source.priority}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <Switch
                           checked={source.is_active ?? true}
                           onCheckedChange={(checked) =>
                             toggleActive({ id: source.id, is_active: checked })
                           }
                         />
                       </TableCell>
                       <TableCell>
                         <span className="text-sm text-muted-foreground">
                           {source.last_scrape_at
                             ? formatDistanceToNow(new Date(source.last_scrape_at), {
                                 addSuffix: true,
                               })
                             : 'Never'}
                         </span>
                       </TableCell>
                       <TableCell>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8">
                               <MoreHorizontal className="w-4 h-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="border-2 border-black">
                             <DropdownMenuItem onClick={() => handleEditSource(source)}>
                               <Pencil className="w-4 h-4 mr-2" />
                               Edit
                             </DropdownMenuItem>
                             <DropdownMenuItem
                               onClick={() => handleScrapeSource(source)}
                               disabled={scrapingSourceId === source.id}
                             >
                               <RefreshCw
                                 className={`w-4 h-4 mr-2 ${
                                   scrapingSourceId === source.id ? 'animate-spin' : ''
                                 }`}
                               />
                               {scrapingSourceId === source.id ? 'Scraping...' : 'Scrape Now'}
                             </DropdownMenuItem>
                             <DropdownMenuItem
                               onClick={() => handleDeleteClick(source)}
                               className="text-destructive focus:text-destructive"
                             >
                               <Trash2 className="w-4 h-4 mr-2" />
                               Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             )}
           </CardContent>
         </Card>
       </main>
 
       <SourceDialog
         open={dialogOpen}
         onOpenChange={setDialogOpen}
         source={editingSource}
         onSubmit={handleDialogSubmit}
         isLoading={isCreating || isUpdating}
       />
 
       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
         <AlertDialogContent className="border-4 border-black">
           <AlertDialogHeader>
             <AlertDialogTitle className="font-black">Delete Source</AlertDialogTitle>
             <AlertDialogDescription>
               Are you sure you want to delete "{sourceToDelete?.name}"? This action cannot
               be undone. All articles from this source will remain but won't receive
               updates.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel className="border-2 border-black font-bold">
               Cancel
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={handleConfirmDelete}
               className="bg-destructive text-destructive-foreground border-2 border-black font-bold"
               disabled={isDeleting}
             >
               {isDeleting ? 'Deleting...' : 'Delete'}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   );
 };
 
 export default Sources;