 import { Header } from '@/components/Header';
 import { Footer } from '@/components/Footer';
 import { StatusBar } from '@/components/StatusBar';
 import { motion } from 'framer-motion';
 
 const Privacy = () => {
   return (
     <div className="min-h-screen bg-background flex flex-col">
       <StatusBar />
       <Header />
       
       <main className="flex-1 container py-12">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert"
         >
           <h1 className="text-4xl font-mono font-black mb-2">Privacy Policy</h1>
           <p className="terminal-text mb-8">Last updated: February 5, 2025</p>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">1. Introduction</h2>
             <p className="text-muted-foreground text-sm">
               NOOZ.NEWS ("we," "our," or "us") respects your privacy and is committed to protecting 
               your personal data. This Privacy Policy explains how we collect, use, disclose, and 
               safeguard your information when you visit our website nooz.news (the "Site") or use 
               our services.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">2. Information We Collect</h2>
             <h3 className="font-mono font-bold mb-2">2.1 Information You Provide</h3>
             <ul className="text-sm text-muted-foreground space-y-1 mb-4">
               <li>• Email address (when subscribing to our newsletter)</li>
               <li>• Account information (if you create an account)</li>
               <li>• Communication data (when you contact us)</li>
             </ul>
             <h3 className="font-mono font-bold mb-2">2.2 Automatically Collected Information</h3>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• Device information (browser type, operating system)</li>
               <li>• Usage data (pages visited, time spent, click patterns)</li>
               <li>• IP address and approximate location</li>
               <li>• Cookies and similar tracking technologies</li>
             </ul>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">3. How We Use Your Information</h2>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• To provide and maintain our news aggregation service</li>
               <li>• To send you our newsletter (with your consent)</li>
               <li>• To analyze usage patterns and improve our platform</li>
               <li>• To display relevant advertisements</li>
               <li>• To detect and prevent fraud or abuse</li>
               <li>• To comply with legal obligations</li>
             </ul>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">4. Cookies and Tracking</h2>
             <p className="text-muted-foreground text-sm mb-4">
               We use cookies and similar technologies to enhance your experience. These include:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• <strong>Essential cookies:</strong> Required for site functionality</li>
               <li>• <strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
               <li>• <strong>Advertising cookies:</strong> Used by Google AdSense to display relevant ads</li>
             </ul>
             <p className="text-muted-foreground text-sm mt-4">
               You can control cookies through your browser settings. Note that disabling certain 
               cookies may affect site functionality.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">5. Third-Party Services</h2>
             <p className="text-muted-foreground text-sm mb-4">We work with the following third parties:</p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• <strong>Google AdSense:</strong> For displaying advertisements</li>
               <li>• <strong>Analytics providers:</strong> For understanding site usage</li>
               <li>• <strong>News sources:</strong> We link to external news publications</li>
             </ul>
             <p className="text-muted-foreground text-sm mt-4">
               Each third party has their own privacy policy governing their data practices.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">6. Data Security</h2>
             <p className="text-muted-foreground text-sm">
               We implement appropriate technical and organizational security measures to protect 
               your personal data against unauthorized access, alteration, disclosure, or destruction. 
               However, no method of transmission over the Internet is 100% secure, and we cannot 
               guarantee absolute security.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">7. Your Rights</h2>
             <p className="text-muted-foreground text-sm mb-4">
               Depending on your jurisdiction, you may have the right to:
             </p>
             <ul className="text-sm text-muted-foreground space-y-1">
               <li>• Access the personal data we hold about you</li>
               <li>• Request correction of inaccurate data</li>
               <li>• Request deletion of your data</li>
               <li>• Object to processing of your data</li>
               <li>• Request data portability</li>
               <li>• Withdraw consent at any time</li>
             </ul>
             <p className="text-muted-foreground text-sm mt-4">
               To exercise these rights, contact us at privacy@nooz.news
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">8. Data Retention</h2>
             <p className="text-muted-foreground text-sm">
               We retain your personal data only for as long as necessary to fulfill the purposes 
               for which it was collected, including to satisfy legal, accounting, or reporting 
               requirements. Newsletter subscribers' data is retained until they unsubscribe.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">9. Children's Privacy</h2>
             <p className="text-muted-foreground text-sm">
               Our service is not directed to children under 13 (or 16 in certain jurisdictions). 
               We do not knowingly collect personal data from children. If you believe we have 
               collected data from a child, please contact us immediately.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 mb-6">
             <h2 className="text-xl font-mono font-bold mb-4">10. Changes to This Policy</h2>
             <p className="text-muted-foreground text-sm">
               We may update this Privacy Policy from time to time. We will notify you of any 
               changes by posting the new Privacy Policy on this page and updating the "Last updated" 
               date. Your continued use of the Site after changes constitutes acceptance.
             </p>
           </section>
 
           <section className="border border-border-strong p-6 bg-card">
             <h2 className="text-xl font-mono font-bold mb-4">11. Contact Us</h2>
             <p className="text-muted-foreground text-sm">
               For privacy-related inquiries, please contact:<br />
               <strong>Email:</strong> privacy@nooz.news<br />
               <strong>Subject Line:</strong> Privacy Inquiry
             </p>
           </section>
         </motion.div>
       </main>
       
       <Footer />
     </div>
   );
 };
 
 export default Privacy;