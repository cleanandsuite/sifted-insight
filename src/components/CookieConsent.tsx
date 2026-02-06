import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'nooz_cookie_consent';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="container max-w-4xl">
            <div className="bg-card border border-border-strong rounded-lg shadow-lg p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Cookie Policy
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Learn more
                    </Link>
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleAccept} size="sm">
                      Accept All
                    </Button>
                    <Button onClick={handleDecline} variant="outline" size="sm">
                      Decline
                    </Button>
                  </div>
                </div>
                
                <button
                  onClick={handleDecline}
                  className="p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
