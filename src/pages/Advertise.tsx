 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { StatusBar } from '@/components/StatusBar';
 import { motion } from 'framer-motion';
 import { BarChart3, Users, Target, Mail } from 'lucide-react';
 
 const Advertise = () => {
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
           <h1 className="text-4xl font-mono font-black mb-2">Advertise With Us</h1>
           <p className="text-xl text-muted-foreground mb-8">
             Reach an engaged audience of tech enthusiasts, investors, and informed professionals.
           </p>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">Why NOOZ.NEWS?</h2>
             <div className="grid md:grid-cols-3 gap-4">
               <div className="text-center p-4">
                 <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                 <div className="font-mono font-bold">Engaged Readers</div>
                 <p className="text-sm text-muted-foreground">
                   Professionals seeking curated, quality news
                 </p>
               </div>
               <div className="text-center p-4">
                 <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                 <div className="font-mono font-bold">Targeted Categories</div>
                 <p className="text-sm text-muted-foreground">
                   Tech, Finance, Politics, Climate audiences
                 </p>
               </div>
               <div className="text-center p-4">
                 <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                 <div className="font-mono font-bold">Premium Placement</div>
                 <p className="text-sm text-muted-foreground">
                   Non-intrusive, contextual advertising
                 </p>
               </div>
             </div>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">Advertising Options</h2>
             <ul className="text-sm text-muted-foreground space-y-3">
               <li className="flex items-start gap-2">
                 <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0" />
                 <div>
                   <strong>Display Advertising:</strong> Banner placements throughout the site via Google AdSense
                 </div>
               </li>
               <li className="flex items-start gap-2">
                 <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0" />
                 <div>
                   <strong>Sponsored Content:</strong> Clearly labeled sponsored articles in relevant categories
                 </div>
               </li>
               <li className="flex items-start gap-2">
                 <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0" />
                 <div>
                   <strong>Newsletter Sponsorship:</strong> Exclusive placement in our daily digest
                 </div>
               </li>
             </ul>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">Our Standards</h2>
             <p className="text-muted-foreground text-sm mb-4">
               We maintain strict separation between editorial content and advertising:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• All sponsored content is clearly labeled</li>
               <li>• Advertisers cannot influence our news selection</li>
               <li>• We reserve the right to decline ads that conflict with our values</li>
               <li>• No deceptive or misleading advertisements</li>
             </ul>
           </section>
 
           <section className="border border-border-strong p-6 bg-primary text-primary-foreground">
             <h2 className="text-xl font-mono font-bold mb-4 flex items-center gap-2">
               <Mail className="w-5 h-5" />
               Get in Touch
             </h2>
             <p className="text-sm opacity-90 mb-4">
               Interested in reaching our audience? Let's discuss how we can work together.
             </p>
             <a 
               href="mailto:advertise@nooz.news"
               className="inline-block px-4 py-2 bg-background text-foreground font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
             >
               Contact: advertise@nooz.news
             </a>
           </section>
         </motion.div>
       </main>
       
       <Footer />
     </div>
   );
 };
 
 export default Advertise;