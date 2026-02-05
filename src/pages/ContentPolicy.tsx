 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { StatusBar } from '@/components/StatusBar';
 import { motion } from 'framer-motion';
 
 const ContentPolicy = () => {
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
           <h1 className="text-4xl font-mono font-black mb-2">Content Policy</h1>
           <p className="terminal-text mb-8">Last updated: February 5, 2025</p>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">1. Our Mission</h2>
             <p className="text-muted-foreground text-sm">
               NOOZ.NEWS aims to provide accurate, timely, and balanced news aggregation across 
               technology, finance, politics, and climate topics. We are committed to maintaining 
               high editorial standards while respecting the intellectual property of our source 
               publications.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">2. Source Selection</h2>
             <p className="text-muted-foreground text-sm mb-4">
               We carefully select news sources based on:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• <strong>Credibility:</strong> Established track record of accurate reporting</li>
               <li>• <strong>Editorial Standards:</strong> Clear separation of news and opinion</li>
               <li>• <strong>Transparency:</strong> Corrections policy and source attribution</li>
               <li>• <strong>Independence:</strong> Editorial independence from commercial interests</li>
               <li>• <strong>Diversity:</strong> Representation of multiple perspectives</li>
             </ul>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">3. AI Summarization Standards</h2>
             <p className="text-muted-foreground text-sm mb-4">
               Our AI-generated summaries adhere to the following principles:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• <strong>Accuracy:</strong> Summaries aim to faithfully represent the original content</li>
               <li>• <strong>Neutrality:</strong> AI does not add editorial bias or commentary</li>
               <li>• <strong>Attribution:</strong> All summaries link to the original source</li>
               <li>• <strong>Transparency:</strong> Content is clearly marked as AI-summarized</li>
             </ul>
             <p className="text-muted-foreground text-sm mt-4">
               <strong>Disclaimer:</strong> AI summaries may occasionally contain errors or omissions. 
               We encourage users to read the original articles for complete information.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">4. Content We Do NOT Aggregate</h2>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• Misinformation or disinformation</li>
               <li>• Hate speech or content promoting violence</li>
               <li>• Unverified rumors or conspiracy theories</li>
               <li>• Content from sources with poor accuracy records</li>
               <li>• Clickbait or sensationalized headlines</li>
               <li>• Paid promotional content disguised as news</li>
             </ul>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">5. Fair Use and Copyright</h2>
             <p className="text-muted-foreground text-sm mb-4">
               We operate under fair use principles:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• We display headlines and brief excerpts only</li>
               <li>• AI summaries are transformative works</li>
               <li>• All content links to original sources</li>
               <li>• We do not reproduce full articles</li>
               <li>• Source attribution is always provided</li>
             </ul>
             <p className="text-muted-foreground text-sm mt-4">
               If you are a content owner with concerns, please contact us at copyright@nooz.news
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">6. Corrections and Updates</h2>
             <p className="text-muted-foreground text-sm">
               If a source publication issues a correction, we will update or remove affected 
               content as appropriate. If you notice an error in our summaries, please report 
               it to corrections@nooz.news and we will investigate promptly.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">7. Political Neutrality</h2>
             <p className="text-muted-foreground text-sm">
               NOOZ.NEWS does not endorse political candidates, parties, or positions. Our 
               political coverage aims to be balanced and factual. We aggregate news from 
               sources across the political spectrum to provide diverse perspectives.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">8. Advertising Policy</h2>
             <p className="text-muted-foreground text-sm">
               Advertisements on NOOZ.NEWS are clearly labeled and separated from editorial content. 
               We do not allow advertisers to influence our news selection or summaries. 
               Sponsored content, if any, will be explicitly marked.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 bg-card">
             <h2 className="text-xl font-mono font-bold mb-4">9. Feedback and Concerns</h2>
             <p className="text-muted-foreground text-sm">
               We welcome feedback on our content practices. Contact us at:<br />
               <strong>General:</strong> feedback@nooz.news<br />
               <strong>Corrections:</strong> corrections@nooz.news<br />
               <strong>Copyright:</strong> copyright@nooz.news
             </p>
           </section>
         </motion.div>
       </main>
       
       <Footer />
     </div>
   );
 };
 
 export default ContentPolicy;