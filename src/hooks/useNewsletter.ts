/**
 * Newsletter Subscription Hook
 * 
 * Manages newsletter subscription state and API calls.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sendConfirmationEmail } from '@/integrations/resend';

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

      // Call Supabase function to create subscriber
      const { data, error: dbError } = await supabase
        .rpc('subscribe_email', {
          p_email: email,
          p_frequency: frequency,
          p_categories: categories,
        });

      if (dbError) {
        console.error('Subscription error:', dbError);
        throw new Error('Failed to create subscription');
      }

      // Send confirmation email (this would typically be handled by Edge Function)
      // For now, we'll show the result from the database function
      if (data?.success) {
        setSubscribed(true);
        
        // If verification token is returned, send confirmation email
        if (data.verification_token) {
          await sendConfirmationEmail({
            email,
            verificationToken: data.verification_token,
            frequency,
          });
        }

        return {
          success: true,
          message: data.already_verified 
            ? 'You\'re already subscribed!' 
            : 'Check your email to confirm your subscription!',
          alreadySubscribed: data.already_verified,
        };
      }

      throw new Error('Subscription failed');
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
      const { data, error: dbError } = await supabase
        .rpc('unsubscribe_email', {
          p_token: token,
        });

      if (dbError) {
        console.error('Unsubscribe error:', dbError);
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
      const { data, error: dbError } = await supabase
        .rpc('verify_subscription', {
          p_token: token,
        });

      if (dbError) {
        console.error('Verification error:', dbError);
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
