 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { StatusBar } from '@/components/StatusBar';
 import { motion } from 'framer-motion';
 import { Rss, Brain, Filter, Newspaper, Clock, Zap } from 'lucide-react';
 
 const steps = [
   {
     number: '01',
     icon: Rss,
     title: 'Source Aggregation',
     description: 'We continuously monitor 25+ trusted news sources including TechCrunch, Bloomberg, Reuters, Politico, and more. Our RSS feeds are checked every 15-30 minutes for new content.',
   },
   {
     number: '02',
     icon: Brain,
     title: 'AI Processing',
     description: 'Each article is analyzed by our AI engine which extracts key information, identifies the topic category, and assesses source credibility and content relevance.',
   },
   {
     number: '03',
     icon: Filter,
     title: 'Smart Categorization',
     description: 'Articles are automatically classified into Tech, Finance, Politics, or Climate categories using natural language processing. Related stories are clustered together.',
   },
   {
     number: '04',
     icon: Newspaper,
     title: 'Intelligent Summarization',
     description: 'Our AI generates concise summaries that capture the essential facts, key points, and actionable takeaways—reducing reading time by up to 80%.',
   },
   {
     number: '05',
     icon: Clock,
     title: 'Ranking & Delivery',
     description: 'Stories are ranked by recency, source authority, and engagement potential. The most important news rises to the top of your personalized feed.',
   },
 ];
 
 const HowItWorks = () => {
   return (
     <div className="min-h-screen bg-background flex flex-col">
       <StatusBar />
       <Header />
       
       <main className="flex-1 container py-12">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-3xl mx-auto"
         >
           {/* Hero */}
           <div className="mb-12">
             <h1 className="text-4xl md:text-5xl font-mono font-black mb-6">
               How <span className="text-primary">NOOZ</span> Works
             </h1>
             <p className="text-xl text-muted-foreground">
               From raw RSS feeds to curated news digest in seconds. 
               Here's the tech behind the magic.
             </p>
           </div>
 
           {/* Process Steps */}
           <div className="space-y-6 mb-12">
             {steps.map((step, index) => (
               <motion.div
                 key={step.number}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className="border border-border-strong p-6 relative"
               >
                 <div className="flex items-start gap-4">
                   <div className="flex-shrink-0">
                     <div className="w-12 h-12 bg-primary flex items-center justify-center">
                       <step.icon className="w-6 h-6 text-primary-foreground" />
                     </div>
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                       <span className="terminal-text text-primary">{step.number}</span>
                       <h3 className="font-mono font-bold text-lg">{step.title}</h3>
                     </div>
                     <p className="text-muted-foreground">{step.description}</p>
                   </div>
                 </div>
               </motion.div>
             ))}
           </div>
 
           {/* Stats */}
           <div className="grid grid-cols-3 gap-4 mb-12">
             <div className="border border-border-strong p-4 text-center">
               <div className="text-3xl font-mono font-black text-primary">25+</div>
               <div className="terminal-text">Sources</div>
             </div>
             <div className="border border-border-strong p-4 text-center">
               <div className="text-3xl font-mono font-black text-primary">15min</div>
               <div className="terminal-text">Update Cycle</div>
             </div>
             <div className="border border-border-strong p-4 text-center">
               <div className="text-3xl font-mono font-black text-primary">80%</div>
               <div className="terminal-text">Time Saved</div>
             </div>
           </div>
 
           {/* Tech Stack */}
           <section className="border border-border-strong p-6 bg-card">
             <h2 className="text-2xl font-mono font-bold mb-4 flex items-center gap-2">
               <Zap className="w-6 h-6 text-primary" />
               The Technology
             </h2>
             <p className="text-muted-foreground mb-4">
               NOOZ is built on a modern, scalable architecture designed for real-time news processing:
             </p>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-primary" />
                 Advanced NLP models for content analysis and summarization
               </li>
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-primary" />
                 Real-time RSS parsing with intelligent deduplication
               </li>
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-primary" />
                 Machine learning-based article ranking algorithms
               </li>
               <li className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-primary" />
                 Edge-deployed serverless functions for instant processing
               </li>
             </ul>
           </section>
         </motion.div>
       </main>
       
       <Footer />
     </div>
   );
 };
 
 export default HowItWorks;