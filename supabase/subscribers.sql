-- ============================================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- Email capture and newsletter management
-- ============================================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SUBSCRIBERS TABLE
-- Stores newsletter subscribers with their preferences
-- ============================================================================

CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT false,
    frequency VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly'
    categories TEXT[] DEFAULT '{}', -- Array of category names the subscriber is interested in
    
    -- Verification tokens
    verification_token VARCHAR(64) UNIQUE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Unsubscribe tokens
    unsubscribe_token VARCHAR(64) UNIQUE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_reason TEXT,
    
    -- Metrics
    emails_sent INTEGER DEFAULT 0,
    last_email_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_verified ON subscribers(is_verified);
CREATE INDEX idx_subscribers_frequency ON subscribers(frequency);
CREATE INDEX idx_subscribers_verification_token ON subscribers(verification_token);
CREATE INDEX idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token);
CREATE INDEX idx_subscribers_created ON subscribers(created_at DESC);

-- ============================================================================
-- EMAIL_HISTORY TABLE
-- Tracks sent emails for analytics and debugging
-- ============================================================================

CREATE TABLE email_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'daily_digest', 'weekly_recap'
    subject TEXT NOT NULL,
    content_html TEXT,
    articles_included JSONB DEFAULT '[]', -- Array of article IDs included
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_history_subscriber ON email_history(subscriber_id);
CREATE INDEX idx_email_history_type ON email_history(email_type);
CREATE INDEX idx_email_history_status ON email_history(status);
CREATE INDEX idx_email_history_sent ON email_history(sent_at DESC);

-- ============================================================================
-- CATEGORIES TABLE (already exists in schema.sql, ensure these entries exist)
-- ============================================================================

-- Insert default categories if they don't exist
INSERT INTO categories (name, slug, description) VALUES
    ('Technology', 'technology', 'Tech news, gadgets, software, and digital innovation'),
    ('Business', 'business', 'Business, finance, markets, and entrepreneurship'),
    ('Politics', 'politics', 'Political news and policy'),
    ('Science', 'science', 'Scientific discoveries and research'),
    ('Health', 'health', 'Health, medicine, and wellness'),
    ('Entertainment', 'entertainment', 'Movies, TV, music, and celebrity news'),
    ('Sports', 'sports', 'Sports news and events'),
    ('World', 'world', 'International news and global events')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate secure verification token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN ENCODE(SHA256((RANDOM() || NOW()::TEXT)::BYTEA), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Generate unsubscribe token
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN ENCODE(SHA256((RANDOM() || NOW()::TEXT || 'unsubscribe')::BYTEA), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUBSCRIBER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create new subscriber
CREATE OR REPLACE FUNCTION subscribe_email(
    p_email TEXT,
    p_frequency VARCHAR(20) DEFAULT 'daily',
    p_categories TEXT[] DEFAULT '{}'
) RETURNS JSON AS $$
DECLARE
    new_subscriber subscribers;
    v_token VARCHAR(64);
BEGIN
    -- Check if already subscribed
    SELECT * INTO new_subscriber 
    FROM subscribers 
    WHERE email = p_email;
    
    IF new_subscriber.id IS NOT NULL THEN
        IF new_subscriber.is_verified THEN
            RETURN json_build_object(
                'success', true,
                'message', 'Email already subscribed',
                'already_verified', true
            );
        ELSE
            -- Resend verification
            v_token := generate_verification_token();
            UPDATE subscribers SET
                verification_token = v_token,
                frequency = p_frequency,
                categories = p_categories,
                unsubscribed_at = NULL,
                unsubscribed_reason = NULL,
                updated_at = NOW()
            WHERE id = new_subscriber.id;
            
            RETURN json_build_object(
                'success', true,
                'message', 'Verification email resent',
                'subscriber_id', new_subscriber.id,
                'verification_token', v_token,
                'already_verified', false
            );
        END IF;
    END IF;
    
    -- Create new subscriber
    v_token := generate_verification_token();
    
    INSERT INTO subscribers (
        email,
        frequency,
        categories,
        verification_token
    ) VALUES (
        p_email,
        COALESCE(p_frequency, 'daily'),
        COALESCE(p_categories, '{}'),
        v_token
    ) RETURNING * INTO new_subscriber;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Subscription created, verification email sent',
        'subscriber_id', new_subscriber.id,
        'verification_token', v_token,
        'already_verified', false
    );
END;
$$ LANGUAGE plpgsql;

-- Verify subscription
CREATE OR REPLACE FUNCTION verify_subscription(p_token VARCHAR(64))
RETURNS JSON AS $$
DECLARE
    sub subscribers;
BEGIN
    SELECT * INTO sub
    FROM subscribers
    WHERE verification_token = p_token;
    
    IF sub.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid verification token'
        );
    END IF;
    
    UPDATE subscribers SET
        is_verified = true,
        verified_at = NOW(),
        verification_token = NULL,
        updated_at = NOW()
    WHERE id = sub.id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Subscription verified successfully',
        'email', sub.email
    );
END;
$$ LANGUAGE plpgsql;

-- Unsubscribe
CREATE OR REPLACE FUNCTION unsubscribe_email(
    p_token VARCHAR(64),
    p_reason TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    sub subscribers;
BEGIN
    SELECT * INTO sub
    FROM subscribers
    WHERE unsubscribe_token = p_token;
    
    IF sub.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid unsubscribe token'
        );
    END IF;
    
    UPDATE subscribers SET
        is_verified = false,
        unsubscribed_at = NOW(),
        unsubscribed_reason = COALESCE(p_reason, 'No reason provided'),
        unsubscribe_token = NULL,
        updated_at = NOW()
    WHERE id = sub.id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Successfully unsubscribed',
        'email', sub.email
    );
END;
$$ LANGUAGE plpgsql;

-- Get unverified subscribers (for cleanup)
CREATE OR REPLACE FUNCTION get_unverified_subscribers(days_old INTEGER DEFAULT 7)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    days_pending INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.email,
        s.created_at,
        (NOW() - s.created_at)::TEXT::INTEGER as days_pending
    FROM subscribers s
    WHERE s.is_verified = false
    AND s.created_at < NOW() - (days_old || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENT ON TABLES
-- ============================================================================

COMMENT ON TABLE subscribers IS 'Newsletter subscribers with preferences and verification status';
COMMENT ON TABLE email_history IS 'Email sending history for analytics and debugging';
