export const Footer = () => {
  return (
    <footer className="w-full border-t border-border-strong bg-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-foreground flex items-center justify-center">
                <span className="text-background font-mono font-bold text-sm">S/</span>
              </div>
              <span className="font-mono text-xl font-semibold tracking-tight">SIFT</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              AI-powered news aggregation. We scrape, summarize, and serve you the stories that matter—faster.
            </p>
            <div className="terminal-text text-muted-foreground">
              © 2025 Sift. All rights reserved.
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="terminal-text font-medium text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">About</span></li>
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
        <div className="container py-4 flex items-center justify-between">
          <span className="terminal-text text-muted-foreground">
            Built with AI. Curated for humans.
          </span>
          <div className="flex items-center gap-2">
            <span className="status-pulse" />
            <span className="terminal-text">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
