import { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsletterSignupProps {
  variant?: 'sidebar' | 'inline' | 'footer';
}

export const NewsletterSignup = ({ variant = 'sidebar' }: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email },
      });
      
      if (error) throw error;
      
      setStatus('success');
      toast({
        title: "You're in!",
        description: "Welcome to the NOOZ crew. Check your inbox soon.",
      });
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setEmail('');
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      toast({
        title: "Oops!",
        description: "Something went wrong. Try again?",
        variant: "destructive",
      });
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (variant === 'inline') {
    return (
      <div className="border border-border-strong bg-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Get Sifted Daily</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          AI-curated news digest. No spam, just the stories that matter.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2 text-sm border border-border-strong bg-background focus:outline-none focus:border-primary"
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div key="arrow">
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </form>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="max-w-md">
        <h4 className="font-mono text-sm font-medium mb-2">Get Sifted Daily</h4>
        <p className="text-xs text-muted-foreground mb-4">
          AI-curated news digest delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:border-primary"
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className="border border-border-strong bg-foreground text-background">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4" />
          <h3 className="font-mono text-sm font-medium">Get Sifted Daily</h3>
        </div>
        <p className="text-xs opacity-70 mb-4">
          AI-curated news digest delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm bg-transparent border border-background/30 placeholder:text-background/50 focus:outline-none focus:border-background mb-2"
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
};
