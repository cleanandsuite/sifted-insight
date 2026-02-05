 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { StatusBar } from '@/components/StatusBar';
 import { motion } from 'framer-motion';
 import { Cpu, Zap, Shield, Users, Coffee, Sparkles } from 'lucide-react';
 
 const About = () => {
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
           {/* Hero Section */}
           <div className="mb-12">
             <h1 className="text-4xl md:text-5xl font-mono font-black mb-6">
               About <span className="text-primary">NOOZ</span>.NEWS
             </h1>
             <p className="text-xl text-muted-foreground leading-relaxed">
               We're the news aggregator that actually respects your time. 
               Because life's too short to read 47 paragraphs about what could've been said in 3 sentences.
             </p>
           </div>
 
           {/* The Story */}
           <section className="mb-12 border border-border-strong p-6">
             <h2 className="text-2xl font-mono font-bold mb-4">Our Origin Story</h2>
             <p className="text-muted-foreground mb-4">
               It all started when our founder rage-quit reading a 2,000-word article 
               only to discover the actual news was in the last paragraph. 
               Sound familiar? We thought so.
             </p>
             <p className="text-muted-foreground mb-4">
               NOOZ.NEWS was born from a simple frustration: <strong>news shouldn't require a PhD in Patience.</strong> 
               We built an AI-powered news aggregation platform that does the heavy lifting—
               scanning, summarizing, and serving you the stories that actually matter.
             </p>
             <p className="text-muted-foreground">
               Our AI reads Bloomberg so you don't fall asleep. 
               It scans political coverage so you stay informed without the drama. 
               It monitors climate reports so you know what's happening to our planet—
               without the existential dread taking three hours to set in.
             </p>
           </section>
 
           {/* What We Do */}
           <section className="mb-12">
             <h2 className="text-2xl font-mono font-bold mb-6">What We Actually Do</h2>
             <div className="grid md:grid-cols-2 gap-4">
               <div className="border border-border-strong p-4">
                 <Cpu className="w-8 h-8 text-primary mb-3" />
                 <h3 className="font-mono font-bold mb-2">AI-Powered Curation</h3>
                 <p className="text-sm text-muted-foreground">
                   Our algorithms scan hundreds of sources to find the stories worth your attention. 
                   No clickbait. No fluff. Just news.
                 </p>
               </div>
               <div className="border border-border-strong p-4">
                 <Zap className="w-8 h-8 text-primary mb-3" />
                 <h3 className="font-mono font-bold mb-2">Instant Summaries</h3>
                 <p className="text-sm text-muted-foreground">
                   We turn 10-minute reads into 2-minute digests. 
                   Same information, 80% less scrolling.
                 </p>
               </div>
               <div className="border border-border-strong p-4">
                 <Shield className="w-8 h-8 text-primary mb-3" />
                 <h3 className="font-mono font-bold mb-2">Source Transparency</h3>
                 <p className="text-sm text-muted-foreground">
                   Every story links to its original source. 
                   We aggregate, we don't appropriate.
                 </p>
               </div>
               <div className="border border-border-strong p-4">
                 <Sparkles className="w-8 h-8 text-primary mb-3" />
                 <h3 className="font-mono font-bold mb-2">Smart Categorization</h3>
                 <p className="text-sm text-muted-foreground">
                   Tech, Finance, Politics, Climate—we sort it so you can 
                   dive straight into what interests you.
                 </p>
               </div>
             </div>
           </section>
 
           {/* Coverage Areas */}
           <section className="mb-12 border border-border-strong p-6">
             <h2 className="text-2xl font-mono font-bold mb-4">Our Coverage</h2>
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <h3 className="font-mono font-bold text-primary mb-2">Tech News</h3>
                 <p className="text-sm text-muted-foreground">
                   AI breakthroughs, startup funding, product launches, cybersecurity, 
                   and everything happening in Silicon Valley (and beyond).
                 </p>
               </div>
               <div>
                 <h3 className="font-mono font-bold text-primary mb-2">Financial News</h3>
                 <p className="text-sm text-muted-foreground">
                   Market movements, economic indicators, cryptocurrency, 
                   and business news that affects your portfolio.
                 </p>
               </div>
               <div>
                 <h3 className="font-mono font-bold text-primary mb-2">Political Analysis</h3>
                 <p className="text-sm text-muted-foreground">
                   Policy updates, election coverage, legislative changes, 
                   and geopolitical developments—minus the partisan shouting.
                 </p>
               </div>
               <div>
                 <h3 className="font-mono font-bold text-primary mb-2">Climate Coverage</h3>
                 <p className="text-sm text-muted-foreground">
                   Environmental news, clean energy developments, climate policy, 
                   and sustainability updates.
                 </p>
               </div>
             </div>
           </section>
 
           {/* The Team */}
           <section className="mb-12">
             <h2 className="text-2xl font-mono font-bold mb-4">The Team</h2>
             <div className="border border-border-strong p-6">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-primary flex items-center justify-center flex-shrink-0">
                   <Coffee className="w-6 h-6 text-primary-foreground" />
                 </div>
                 <div>
                   <p className="text-muted-foreground mb-4">
                     We're a small team of engineers, data scientists, and recovering journalists 
                     who believe the future of news consumption shouldn't require an attention span 
                     measured in geological time periods.
                   </p>
                   <p className="text-muted-foreground">
                     Based in the cloud (because where else would we be in 2025?), 
                     powered by coffee, and motivated by the simple belief that 
                     <strong> staying informed shouldn't be a full-time job</strong>.
                   </p>
                 </div>
               </div>
             </div>
           </section>
 
           {/* Contact */}
           <section className="border border-border-strong p-6 bg-card">
             <h2 className="text-2xl font-mono font-bold mb-4">Get In Touch</h2>
             <p className="text-muted-foreground mb-4">
               Got feedback? Found a bug? Want to tell us your favorite news source? 
               We're all ears (well, all inboxes).
             </p>
             <div className="flex items-center gap-4">
               <Users className="w-5 h-5 text-primary" />
               <a 
                 href="mailto:hello@nooz.news" 
                 className="text-primary hover:underline font-mono"
               >
                 hello@nooz.news
               </a>
             </div>
           </section>
         </motion.div>
       </main>
       
       <Footer />
     </div>
   );
 };
 
 export default About;