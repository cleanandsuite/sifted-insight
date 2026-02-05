import { Link } from 'react-router-dom';
import { Twitter, Rss } from 'lucide-react';
import { NewsletterSignup } from './NewsletterSignup';
import { Logo } from './Header';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border-strong bg-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              News, but make it snappy. Our AI reads the boring stuff so you don't have to. You're welcome.
            </p>
            
            {/* Newsletter in footer */}
            <NewsletterSignup variant="footer" />
          </div>
          
          {/* Links */}
          <div>
            <h4 className="terminal-text font-medium text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/sources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sources</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="terminal-text font-medium text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/content-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Content Policy</Link></li>
              <li><Link to="/advertise" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Advertise</Link></li>
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
