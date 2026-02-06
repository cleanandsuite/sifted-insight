/**
 * Unsubscribe Page
 * 
 * Allows users to unsubscribe from the newsletter via email link.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNewsletter } from '@/hooks/useNewsletter';

export const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { unsubscribe, loading, error } = useNewsletter();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (token) {
      const processUnsubscribe = async () => {
        const result = await unsubscribe(token);
        setResult(result);
      };
      processUnsubscribe();
    }
  }, [token, unsubscribe]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-foreground mx-auto mb-6 flex items-center justify-center">
            <span className="text-background font-mono font-bold text-2xl">S/</span>
          </div>
          <h1 className="text-2xl font-semibold mb-4">Unsubscribe</h1>
          <p className="text-muted-foreground">
            Invalid unsubscribe link. Please contact support or try again.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-foreground mx-auto mb-6 flex items-center justify-center">
            <span className="text-background font-mono font-bold text-2xl">S/</span>
          </div>
          <h1 className="text-2xl font-semibold mb-4">Unsubscribing...</h1>
          <p className="text-muted-foreground">Please wait while we process your request.</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-foreground mx-auto mb-6 flex items-center justify-center">
            <span className="text-background font-mono font-bold text-2xl">S/</span>
          </div>
          <h1 className={`text-2xl font-semibold mb-4 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.success ? 'Unsubscribed' : 'Error'}
          </h1>
          <p className="text-muted-foreground mb-6">{result.message}</p>
          {result.success && (
            <a
              href="/"
              className="inline-block px-6 py-3 bg-foreground text-background font-mono font-medium rounded-md"
            >
              Return to Sift
            </a>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-foreground mx-auto mb-6 flex items-center justify-center">
            <span className="text-background font-mono font-bold text-2xl">S/</span>
          </div>
          <h1 className="text-2xl font-semibold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-foreground text-background font-mono font-medium rounded-md"
          >
            Return to Sift
          </a>
        </div>
      </div>
    );
  }

  return null;
};

export default UnsubscribePage;
