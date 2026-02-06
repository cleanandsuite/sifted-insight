import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatusBar } from '@/components/StatusBar';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <meta name="tiktok-developers-site-verification" content="v2oO2F1z9in0iYCNaDGDJtXAwXM6t8So" />
      </Helmet>
      <StatusBar />
      <Header />
       
       <main className="flex-1 container py-12">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-3xl mx-auto"
         >
           <h1 className="text-4xl font-mono font-black mb-2">Terms of Service</h1>
           <p className="terminal-text mb-8">Last updated: February 5, 2025</p>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">1. Acceptance of Terms</h2>
             <p className="text-muted-foreground text-sm">
               By accessing or using NOOZ.NEWS (the "Service"), you agree to be bound by these 
               Terms of Service ("Terms"). If you do not agree to these Terms, you may not 
               access or use the Service. These Terms constitute a legally binding agreement 
               between you and NOOZ.NEWS.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">2. Description of Service</h2>
             <p className="text-muted-foreground text-sm mb-4">
               NOOZ.NEWS is a news aggregation platform that:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• Aggregates news content from third-party sources</li>
               <li>• Provides AI-generated summaries of news articles</li>
               <li>• Links to original source publications</li>
               <li>• Offers categorized news feeds (Tech, Finance, Politics, Climate)</li>
             </ul>
             <p className="text-muted-foreground text-sm mt-4">
               We do not create original news content. All articles are sourced from and credited 
               to their original publishers.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">3. User Conduct</h2>
             <p className="text-muted-foreground text-sm mb-4">You agree NOT to:</p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• Use the Service for any unlawful purpose</li>
               <li>• Attempt to gain unauthorized access to our systems</li>
               <li>• Scrape, copy, or redistribute our content without permission</li>
               <li>• Interfere with or disrupt the Service</li>
               <li>• Use automated systems to access the Service in a manner that exceeds reasonable use</li>
               <li>• Impersonate any person or entity</li>
               <li>• Transmit viruses, malware, or other harmful code</li>
               <li>• Circumvent any access controls or rate limits</li>
             </ul>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">4. Intellectual Property</h2>
             <h3 className="font-mono font-bold mb-2">4.1 Our Content</h3>
             <p className="text-muted-foreground text-sm mb-4">
               The NOOZ.NEWS name, logo, website design, and AI-generated summaries are our 
               intellectual property. You may not use, copy, or distribute these without our 
               written permission.
             </p>
             <h3 className="font-mono font-bold mb-2">4.2 Third-Party Content</h3>
             <p className="text-muted-foreground text-sm">
               News articles and content from third-party sources remain the intellectual property 
               of their respective owners. We provide links and summaries under fair use principles. 
               For full articles, please visit the original source.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">5. Disclaimer of Warranties</h2>
             <p className="text-muted-foreground text-sm mb-4">
               THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
               EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• Warranties of merchantability or fitness for a particular purpose</li>
               <li>• Warranties that the Service will be uninterrupted or error-free</li>
               <li>• Warranties regarding the accuracy of AI-generated summaries</li>
               <li>• Warranties regarding the accuracy of third-party content</li>
             </ul>
             <p className="text-muted-foreground text-sm mt-4">
               AI-generated summaries may contain errors or omissions. Always verify important 
               information with the original source.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">6. Limitation of Liability</h2>
             <p className="text-muted-foreground text-sm">
               TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOOZ.NEWS SHALL NOT BE LIABLE FOR ANY 
               INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT 
               NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN 
               CONNECTION WITH YOUR USE OF THE SERVICE, REGARDLESS OF WHETHER SUCH DAMAGES ARE 
               BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">7. Indemnification</h2>
             <p className="text-muted-foreground text-sm">
               You agree to indemnify, defend, and hold harmless NOOZ.NEWS and its officers, 
               directors, employees, and agents from any claims, damages, losses, liabilities, 
               and expenses (including reasonable attorneys' fees) arising out of or related to 
               your use of the Service or violation of these Terms.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">8. Third-Party Links</h2>
             <p className="text-muted-foreground text-sm">
               Our Service contains links to third-party websites and publications. We are not 
               responsible for the content, accuracy, or practices of these third-party sites. 
               Linking to external sites does not constitute endorsement.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">9. Modifications to Service</h2>
             <p className="text-muted-foreground text-sm">
               We reserve the right to modify, suspend, or discontinue the Service (or any part 
               thereof) at any time, with or without notice. We shall not be liable to you or 
               any third party for any modification, suspension, or discontinuance of the Service.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">10. Governing Law</h2>
             <p className="text-muted-foreground text-sm">
               These Terms shall be governed by and construed in accordance with the laws of 
               the State of Delaware, United States, without regard to its conflict of law 
               provisions. Any disputes arising under these Terms shall be subject to the 
               exclusive jurisdiction of the courts located in Delaware.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">11. Severability</h2>
             <p className="text-muted-foreground text-sm">
               If any provision of these Terms is found to be unenforceable or invalid, that 
               provision shall be limited or eliminated to the minimum extent necessary so that 
               these Terms shall otherwise remain in full force and effect.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">12. Changes to Terms</h2>
             <p className="text-muted-foreground text-sm">
               We reserve the right to update these Terms at any time. We will notify users of 
               material changes by posting the updated Terms on this page. Your continued use 
               of the Service after changes constitutes acceptance of the modified Terms.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 bg-card">
             <h2 className="text-xl font-mono font-bold mb-4">13. Contact</h2>
             <p className="text-muted-foreground text-sm">
               For questions about these Terms, please contact:<br />
               <strong>Email:</strong> legal@nooz.news
             </p>
           </section>
         </motion.div>
       </main>
       
       <Footer />
     </div>
   );
 };
 
 export default Terms;