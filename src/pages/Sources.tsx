 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { StatusBar } from '@/components/StatusBar';
 import { motion } from 'framer-motion';
 import { ExternalLink, Cpu, TrendingUp, Landmark, Leaf } from 'lucide-react';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
 const categoryIcons = {
   tech: Cpu,
   finance: TrendingUp,
   politics: Landmark,
   climate: Leaf,
 };
 
 const categoryColors = {
   tech: 'text-blue-500',
   finance: 'text-green-500',
   politics: 'text-purple-500',
   climate: 'text-emerald-500',
 };
 
 const Sources = () => {
   const { data: sources, isLoading } = useQuery({
     queryKey: ['public-sources'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('sources')
         .select('id, name, description, website_url, content_category')
         .eq('is_active', true)
         .order('name');
       
       if (error) throw error;
       return data;
     },
   });
 
   const groupedSources = sources?.reduce((acc, source) => {
     const category = source.content_category || 'tech';
     if (!acc[category]) acc[category] = [];
     acc[category].push(source);
     return acc;
   }, {} as Record<string, typeof sources>);
 
   return (
     <div className="min-h-screen bg-background flex flex-col">
       <StatusBar />
       <Header />
       
       <main className="flex-1 container py-12">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-4xl mx-auto"
         >
           {/* Hero */}
           <div className="mb-12">
             <h1 className="text-4xl md:text-5xl font-mono font-black mb-6">
               Our <span className="text-primary">Sources</span>
             </h1>
             <p className="text-xl text-muted-foreground">
               We aggregate news from {sources?.length || '25+'} trusted publications. 
               Every story links back to its original source.
             </p>
           </div>
 
           {/* Source Quality Note */}
           <div className="border border-border-strong p-6 mb-8 bg-card">
             <h2 className="font-mono font-bold mb-2">Source Selection Criteria</h2>
             <p className="text-sm text-muted-foreground">
               We carefully curate our source list based on journalistic standards, 
               factual accuracy, editorial independence, and relevance to our coverage areas. 
               All sources must have a track record of reliable reporting.
             </p>
           </div>
 
           {/* Sources by Category */}
           {isLoading ? (
             <div className="text-center py-12">
               <span className="terminal-text">Loading sources...</span>
             </div>
           ) : (
             <div className="space-y-8">
               {(['tech', 'finance', 'politics', 'climate'] as const).map((category) => {
                 const Icon = categoryIcons[category];
                 const categorySources = groupedSources?.[category] || [];
                 
                 if (categorySources.length === 0) return null;
                 
                 return (
                   <section key={category}>
                     <div className="flex items-center gap-2 mb-4">
                       <Icon className={`w-5 h-5 ${categoryColors[category]}`} />
                       <h2 className="font-mono font-bold text-lg capitalize">{category}</h2>
                       <span className="terminal-text">({categorySources.length})</span>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                       {categorySources.map((source) => (
                         <motion.a
                           key={source.id}
                           href={source.website_url || '#'}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="border border-border-strong p-4 hover:bg-card-hover transition-colors group"
                           whileHover={{ x: 4 }}
                         >
                           <div className="flex items-start justify-between">
                             <div>
                               <h3 className="font-mono font-bold group-hover:text-primary transition-colors">
                                 {source.name}
                               </h3>
                               {source.description && (
                                 <p className="text-sm text-muted-foreground mt-1">
                                   {source.description}
                                 </p>
                               )}
                             </div>
                             <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                           </div>
                         </motion.a>
                       ))}
                     </div>
                   </section>
                 );
               })}
             </div>
           )}
 
           {/* Add Source */}
           <div className="mt-12 border border-border-strong p-6">
             <h2 className="font-mono font-bold mb-2">Suggest a Source</h2>
             <p className="text-sm text-muted-foreground mb-4">
               Know a great publication we should add? We're always looking to expand 
               our coverage while maintaining quality standards.
             </p>
             <a 
               href="mailto:sources@nooz.news"
               className="inline-block px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
             >
               Suggest Source
             </a>
           </div>
         </motion.div>
       </main>
       
       <Footer />
     </div>
   );
 };
 
 export default Sources;