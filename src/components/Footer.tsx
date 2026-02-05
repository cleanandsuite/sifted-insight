import { Link } from 'react-router-dom';
import { Twitter, Rss } from 'lucide-react';
import { NewsletterSignup } from './NewsletterSignup';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border-strong bg-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-mono font-bold text-lg">N</span>
                </div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-mono text-lg font-bold tracking-tight">NOOZ</span>
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest">.NEWS</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              AI-powered news aggregation. We curate, summarize, and deliver the stories that matter—faster.
            </p>
            
            {/* Newsletter in footer */}
            <NewsletterSignup variant="footer" />
          </div>
          
          {/* Links */}
          <div>
            <h4 className="terminal-text font-medium text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">How It Works</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Sources</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">API Access</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="terminal-text font-medium text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Content Policy</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Advertise</span></li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="terminal-text text-muted-foreground">
              © 2025 NOOZ.NEWS. All rights reserved.
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="terminal-text text-muted-foreground">
              Built with AI. Curated for humans.
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Social Links */}
            <a 
              href="https://twitter.com/SiftNews" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 border border-border-strong hover:bg-card-hover transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="/rss.xml" 
              className="p-2 border border-border-strong hover:bg-card-hover transition-colors"
              aria-label="RSS Feed"
            >
              <Rss className="w-4 h-4" />
            </a>
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="status-pulse" />
              <span className="terminal-text">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
