 import { useState, useEffect } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Switch } from '@/components/ui/switch';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import type { Source, SourceInsert, SourceUpdate } from '@/hooks/useSources';
 
 interface SourceDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   source?: Source | null;
   onSubmit: (data: SourceInsert | (SourceUpdate & { id: string })) => void;
   isLoading?: boolean;
 }
 
 const PRIORITY_OPTIONS = [
   { value: 'low', label: 'Low' },
   { value: 'medium', label: 'Medium' },
   { value: 'high', label: 'High' },
   { value: 'critical', label: 'Critical' },
 ] as const;
 
 export const SourceDialog = ({
   open,
   onOpenChange,
   source,
   onSubmit,
   isLoading,
 }: SourceDialogProps) => {
   const [formData, setFormData] = useState({
     name: '',
     rss_url: '',
     website_url: '',
     description: '',
     priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
     scrape_interval_minutes: 30,
     is_active: true,
   });
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const isEditing = !!source;
 
   useEffect(() => {
     if (source) {
       setFormData({
         name: source.name || '',
         rss_url: source.rss_url || '',
         website_url: source.website_url || '',
         description: source.description || '',
         priority: source.priority || 'medium',
         scrape_interval_minutes: source.scrape_interval_minutes || 30,
         is_active: source.is_active ?? true,
       });
     } else {
       setFormData({
         name: '',
         rss_url: '',
         website_url: '',
         description: '',
         priority: 'medium',
         scrape_interval_minutes: 30,
         is_active: true,
       });
     }
     setErrors({});
   }, [source, open]);
 
   const validateForm = () => {
     const newErrors: Record<string, string> = {};
 
     if (!formData.name || formData.name.length < 2) {
       newErrors.name = 'Name must be at least 2 characters';
     }
 
     if (!formData.rss_url) {
       newErrors.rss_url = 'RSS URL is required';
     } else {
       try {
         new URL(formData.rss_url);
       } catch {
         newErrors.rss_url = 'Must be a valid URL';
       }
     }
 
     if (formData.website_url) {
       try {
         new URL(formData.website_url);
       } catch {
         newErrors.website_url = 'Must be a valid URL';
       }
     }
 
     if (formData.description && formData.description.length > 500) {
       newErrors.description = 'Description must be 500 characters or less';
     }
 
     if (formData.scrape_interval_minutes < 5 || formData.scrape_interval_minutes > 1440) {
       newErrors.scrape_interval_minutes = 'Interval must be between 5 and 1440 minutes';
     }
 
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!validateForm()) return;
 
     if (isEditing && source) {
       onSubmit({
         id: source.id,
         ...formData,
       });
     } else {
       onSubmit(formData);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[500px] border-4 border-black">
         <DialogHeader>
           <DialogTitle className="font-black text-xl">
             {isEditing ? 'Edit Source' : 'Add New Source'}
           </DialogTitle>
           <DialogDescription>
             {isEditing
               ? 'Update the news source details below.'
               : 'Enter the details for the new news source.'}
           </DialogDescription>
         </DialogHeader>
 
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="name">Name *</Label>
             <Input
               id="name"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               placeholder="TechCrunch"
               className="border-2 border-black"
             />
             {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="rss_url">RSS URL *</Label>
             <Input
               id="rss_url"
               value={formData.rss_url}
               onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
               placeholder="https://example.com/feed.xml"
               className="border-2 border-black"
             />
             {errors.rss_url && <p className="text-sm text-destructive">{errors.rss_url}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="website_url">Website URL</Label>
             <Input
               id="website_url"
               value={formData.website_url}
               onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
               placeholder="https://example.com"
               className="border-2 border-black"
             />
             {errors.website_url && <p className="text-sm text-destructive">{errors.website_url}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="description">Description</Label>
             <Textarea
               id="description"
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               placeholder="A brief description of this source..."
               className="border-2 border-black resize-none"
               rows={3}
             />
             {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
           </div>
 
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="priority">Priority</Label>
               <Select
                 value={formData.priority}
                 onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') =>
                   setFormData({ ...formData, priority: value })
                 }
               >
                 <SelectTrigger className="border-2 border-black">
                   <SelectValue placeholder="Select priority" />
                 </SelectTrigger>
                 <SelectContent>
                   {PRIORITY_OPTIONS.map((option) => (
                     <SelectItem key={option.value} value={option.value}>
                       {option.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="scrape_interval">Scrape Interval (min)</Label>
               <Input
                 id="scrape_interval"
                 type="number"
                 min={5}
                 max={1440}
                 value={formData.scrape_interval_minutes}
                 onChange={(e) =>
                   setFormData({ ...formData, scrape_interval_minutes: parseInt(e.target.value) || 30 })
                 }
                 className="border-2 border-black"
               />
               {errors.scrape_interval_minutes && (
                 <p className="text-sm text-destructive">{errors.scrape_interval_minutes}</p>
               )}
             </div>
           </div>
 
           <div className="flex items-center justify-between py-2">
             <Label htmlFor="is_active">Active</Label>
             <Switch
               id="is_active"
               checked={formData.is_active}
               onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
             />
           </div>
 
           <DialogFooter>
             <Button
               type="button"
               variant="outline"
               onClick={() => onOpenChange(false)}
               className="border-2 border-black font-bold"
             >
               Cancel
             </Button>
             <Button
               type="submit"
               disabled={isLoading}
               className="border-2 border-black font-bold"
             >
               {isLoading ? 'Saving...' : isEditing ? 'Update Source' : 'Add Source'}
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 };