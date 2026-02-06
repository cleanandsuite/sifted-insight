/**
 * Newsletter Subscription Hook
 * 
 * Manages newsletter subscription state and API calls.
 * Uses edge functions for newsletter operations.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionFrequency = 'daily' | 'weekly';

export interface NewsletterSubscription {
  email: string;
  frequency: SubscriptionFrequency;
  categories: string[];
}

export interface SubscriptionResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
}

export const useNewsletter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = useCallback(async (
    email: string,
    frequency: SubscriptionFrequency = 'daily',
    categories: string[] = []
  ): Promise<SubscriptionResult> => {
    setLoading(true);
    setError(null);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call edge function for newsletter subscription
      const { data, error: fnError } = await supabase.functions.invoke('subscribe-newsletter', {
        body: {
          email,
          frequency,
          categories,
        }
      });

      if (fnError) {
        console.error('Subscription error:', fnError);
        throw new Error('Failed to create subscription');
      }

      if (data?.success) {
        setSubscribed(true);
        return {
          success: true,
          message: data.already_verified 
            ? 'You\'re already subscribed!' 
            : 'Check your email to confirm your subscription!',
          alreadySubscribed: data.already_verified,
        };
      }

      throw new Error(data?.message || 'Subscription failed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (token: string): Promise<SubscriptionResult> => {
    setLoading(true);
    setError(null);

    try {
      // Call edge function for unsubscribe
      const { data, error: fnError } = await supabase.functions.invoke('subscribe-newsletter', {
        body: {
          action: 'unsubscribe',
          token,
        }
      });

      if (fnError) {
        console.error('Unsubscribe error:', fnError);
        throw new Error('Failed to unsubscribe');
      }

      if (data?.success) {
        setSubscribed(false);
        return {
          success: true,
          message: 'You\'ve been unsubscribed. Sorry to see you go!',
        };
      }

      throw new Error(data?.message || 'Unsubscribe failed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifySubscription = useCallback(async (token: string): Promise<SubscriptionResult> => {
    setLoading(true);
    setError(null);

    try {
      // Call edge function for verification
      const { data, error: fnError } = await supabase.functions.invoke('subscribe-newsletter', {
        body: {
          action: 'verify',
          token,
        }
      });

      if (fnError) {
        console.error('Verification error:', fnError);
        throw new Error('Failed to verify subscription');
      }

      if (data?.success) {
        setSubscribed(true);
        return {
          success: true,
          message: 'Subscription verified! You\'ll start receiving emails soon.',
        };
      }

      throw new Error(data?.message || 'Verification failed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscribe,
    unsubscribe,
    verifySubscription,
    loading,
    error,
    subscribed,
    setSubscribed,
    clearError: () => setError(null),
  };
};
