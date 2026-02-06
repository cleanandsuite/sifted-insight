// =====================================================
// NOOZ Affiliate Products Component
// Displays AI tools and tech products with affiliate links
// =====================================================

import React, { useState, useEffect } from 'react'
import { useSupabase } from '../hooks/useSupabase'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
  regular_price: number | null
  sale_price: number | null
  rating: number | null
  review_count: number | null
  category: string
  tags: string[]
  is_featured: boolean
}

interface AffiliateProductsProps {
  category?: string
  limit?: number
  source?: string
  articleId?: number
  showRating?: boolean
  layout?: 'grid' | 'list' | 'compact'
}

export function AffiliateProducts({ 
  category, 
  limit = 6, 
  source = 'sidebar',
  articleId,
  showRating = true,
  layout = 'grid'
}: AffiliateProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  useEffect(() => {
    loadProducts()
  }, [category, limit])

  async function loadProducts() {
    setLoading(true)
    
    let query = supabase
      .from('affiliate_products')
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        regular_price,
        sale_price,
        rating,
        review_count,
        category,
        tags,
        is_featured
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('clicks', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (!error && data) {
      setProducts(data)
    }
    setLoading(false)
  }

  async function handleClick(product: Product) {
    // Track click
    await supabase.rpc('track_affiliate_click', {
      product_slug: product.slug,
      source_slug: source,
      article_id: articleId || null
    })
    
    // Open affiliate link in new tab
    window.open(`/api/affiliate/${product.slug}`, '_blank')
  }

  if (loading) {
    return (
      <div className="affiliate-products loading">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="product-skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className={`affiliate-products ${layout}`}>
      <h3 className="affiliate-header">
        <span className="icon">⚡</span>
        Recommended Tools
      </h3>
      
      <div className="products-grid">
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`product-card ${product.is_featured ? 'featured' : ''}`}
            onClick={() => handleClick(product)}
          >
            {product.image_url && (
              <div className="product-image">
                <img src={product.image_url} alt={product.name} />
                {product.sale_price && (
                  <span className="sale-badge">SALE</span>
                )}
              </div>
            )}
            
            <div className="product-info">
              <h4 className="product-name">{product.name}</h4>
              <p className="product-description">{product.description}</p>
              
              {showRating && product.rating && (
                <div className="product-rating">
                  <span className="stars">{'⭐'.repeat(Math.round(product.rating / 2))}</span>
                  <span className="count">({product.review_count?.toLocaleString()})</span>
                </div>
              )}
              
              <div className="product-pricing">
                {product.sale_price ? (
                  <>
                    <span className="original-price">${product.regular_price}</span>
                    <span className="sale-price">${product.sale_price}</span>
                  </>
                ) : product.regular_price ? (
                  <span className="price">${product.regular_price}</span>
                ) : null}
              </div>
              
              <button className="affiliate-button">
                {product.category === 'ai_tool' ? 'Try Free' : 
                 product.category === 'software' ? 'Get Started' :
                 product.category === 'hardware' ? 'Shop Now' :
                 product.category === 'course' ? 'Enroll Now' : 'Learn More'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="affiliate-disclosure">
        <small>
          🌟 We may earn a commission when you click our links. 
          <a href="/affiliate-disclosure">Learn more</a>
        </small>
      </div>
    </div>
  )
}

// Compact version for sidebar
export function AffiliateSidebar({ limit = 5 }: { limit?: number }) {
  return (
    <div className="affiliate-sidebar">
      <h4>⚡ Quick Picks</h4>
      <AffiliateProducts 
        layout="list" 
        limit={limit} 
        showRating={false}
      />
    </div>
  )
}

// Featured product for homepage
export function FeaturedAffiliateProduct() {
  const [product, setProduct] = useState<Product | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    async function loadFeatured() {
      const { data } = await supabase
        .from('affiliate_products')
        .select('*')
        .eq('is_featured', true)
        .eq('category', 'ai_tool')
        .limit(1)
        .single()
      
      if (data) setProduct(data)
    }
    loadFeatured()
  }, [])

  if (!product) return null

  return (
    <div className="featured-affiliate" onClick={() => window.open(`/api/affiliate/${product.slug}`, '_blank')}>
      <div className="featured-badge">⭐ Editor's Pick</div>
      <img src={product.image_url || ''} alt={product.name} />
      <div className="featured-content">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="featured-price">
          {product.rating && <span>⭐ {product.rating}/5</span>}
          {product.regular_price && <span>${product.regular_price}</span>}
        </div>
        <button>Try Free →</button>
      </div>
    </div>
  )
}

// Newsletter affiliate section
export function NewsletterAffiliateSection({ issueNumber }: { issueNumber: number }) {
  return (
    <div className="newsletter-affiliates">
      <h3>🛠️ Tools I Use Daily</h3>
      <AffiliateProducts 
        category="ai_tool" 
        limit={3} 
        source="newsletter"
        issueNumber={issueNumber}
        layout="list"
      />
    </div>
  )
}

export default AffiliateProducts
