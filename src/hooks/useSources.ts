 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
 import { toast } from '@/hooks/use-toast';
 
 export type Source = Tables<'sources'>;
 export type SourceInsert = TablesInsert<'sources'>;
 export type SourceUpdate = TablesUpdate<'sources'>;
 
 export const useSources = () => {
   const queryClient = useQueryClient();
 
   // Fetch all sources
   const query = useQuery({
     queryKey: ['sources'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('sources')
         .select('*')
         .order('priority', { ascending: false })
         .order('name');
       
       if (error) throw error;
       return data as Source[];
     },
   });
 
   // Create source mutation
   const createMutation = useMutation({
     mutationFn: async (source: SourceInsert) => {
       const { data, error } = await supabase
         .from('sources')
         .insert(source)
         .select()
         .single();
       
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['sources'] });
       toast({
         title: 'Source Created',
         description: 'The news source has been added successfully.',
       });
     },
     onError: (error: Error) => {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 
   // Update source mutation
   const updateMutation = useMutation({
     mutationFn: async ({ id, ...updates }: SourceUpdate & { id: string }) => {
       const { data, error } = await supabase
         .from('sources')
         .update(updates)
         .eq('id', id)
         .select()
         .single();
       
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['sources'] });
       toast({
         title: 'Source Updated',
         description: 'The news source has been updated successfully.',
       });
     },
     onError: (error: Error) => {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 
   // Delete source mutation
   const deleteMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('sources')
         .delete()
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['sources'] });
       toast({
         title: 'Source Deleted',
         description: 'The news source has been removed.',
       });
     },
     onError: (error: Error) => {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 
   // Toggle active status mutation
   const toggleActiveMutation = useMutation({
     mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
       const { data, error } = await supabase
         .from('sources')
         .update({ is_active })
         .eq('id', id)
         .select()
         .single();
       
       if (error) throw error;
       return data;
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ['sources'] });
       toast({
         title: data.is_active ? 'Source Activated' : 'Source Deactivated',
         description: `${data.name} is now ${data.is_active ? 'active' : 'inactive'}.`,
       });
     },
     onError: (error: Error) => {
       toast({
         title: 'Error',
         description: error.message,
         variant: 'destructive',
       });
     },
   });
 
   return {
     sources: query.data || [],
     isLoading: query.isLoading,
     error: query.error,
     refetch: query.refetch,
     create: createMutation.mutate,
     update: updateMutation.mutate,
     remove: deleteMutation.mutate,
     toggleActive: toggleActiveMutation.mutate,
     isCreating: createMutation.isPending,
     isUpdating: updateMutation.isPending,
     isDeleting: deleteMutation.isPending,
   };
 };