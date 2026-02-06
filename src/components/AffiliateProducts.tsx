// =====================================================
// NOOZ Affiliate Products Component
// Displays AI tools and tech products with affiliate links
// Note: This component requires an 'affiliate_products' table
// to be created in the database before it can function.
// =====================================================

import React, { useState, useEffect } from 'react'

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

// Placeholder data for demo purposes
const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'ChatGPT Plus',
    slug: 'chatgpt-plus',
    description: 'Advanced AI assistant for writing, coding, and more',
    image_url: '/placeholder.svg',
    regular_price: 20,
    sale_price: null,
    rating: 4.8,
    review_count: 15000,
    category: 'ai_tool',
    tags: ['ai', 'writing', 'productivity'],
    is_featured: true,
  },
  {
    id: 2,
    name: 'Midjourney',
    slug: 'midjourney',
    description: 'Create stunning AI-generated images',
    image_url: '/placeholder.svg',
    regular_price: 10,
    sale_price: null,
    rating: 4.7,
    review_count: 8500,
    category: 'ai_tool',
    tags: ['ai', 'images', 'creative'],
    is_featured: true,
  },
];

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

  useEffect(() => {
    // Use placeholder data for now
    // In production, this would fetch from the database
    setTimeout(() => {
      const filtered = category 
        ? PLACEHOLDER_PRODUCTS.filter(p => p.category === category)
        : PLACEHOLDER_PRODUCTS;
      setProducts(filtered.slice(0, limit));
      setLoading(false);
    }, 500);
  }, [category, limit])

  function handleClick(product: Product) {
    // Track click and open affiliate link
    console.log('Affiliate click:', product.slug, 'source:', source);
    window.open(`/api/affiliate/${product.slug}`, '_blank')
  }

  if (loading) {
    return (
      <div className="affiliate-products loading">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="product-skeleton">
            <div className="skeleton-image bg-muted h-32 rounded-lg animate-pulse"></div>
            <div className="skeleton-text bg-muted h-4 rounded mt-2 animate-pulse"></div>
            <div className="skeleton-text short bg-muted h-4 w-2/3 rounded mt-1 animate-pulse"></div>
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
      <h3 className="affiliate-header text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="icon">⚡</span>
        Recommended Tools
      </h3>
      
      <div className={`products-grid ${layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`product-card p-4 border border-border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors ${product.is_featured ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleClick(product)}
          >
            {product.image_url && (
              <div className="product-image relative mb-3">
                <img src={product.image_url} alt={product.name} className="w-full h-24 object-cover rounded" />
                {product.sale_price && (
                  <span className="sale-badge absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">SALE</span>
                )}
              </div>
            )}
            
            <div className="product-info">
              <h4 className="product-name font-medium">{product.name}</h4>
              <p className="product-description text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              
              {showRating && product.rating && (
                <div className="product-rating flex items-center gap-1 mt-2 text-sm">
                  <span className="stars text-yellow-500">{'⭐'.repeat(Math.round(product.rating / 2))}</span>
                  <span className="count text-muted-foreground">({product.review_count?.toLocaleString()})</span>
                </div>
              )}
              
              <div className="product-pricing mt-2">
                {product.sale_price ? (
                  <>
                    <span className="original-price line-through text-muted-foreground">${product.regular_price}</span>
                    <span className="sale-price ml-2 font-semibold text-primary">${product.sale_price}</span>
                  </>
                ) : product.regular_price ? (
                  <span className="price font-semibold">${product.regular_price}/mo</span>
                ) : null}
              </div>
              
              <button className="affiliate-button mt-3 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {product.category === 'ai_tool' ? 'Try Free' : 
                 product.category === 'software' ? 'Get Started' :
                 product.category === 'hardware' ? 'Shop Now' :
                 product.category === 'course' ? 'Enroll Now' : 'Learn More'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="affiliate-disclosure mt-4 text-xs text-muted-foreground">
        <small>
          🌟 We may earn a commission when you click our links. 
          <a href="/affiliate-disclosure" className="underline ml-1">Learn more</a>
        </small>
      </div>
    </div>
  )
}

// Compact version for sidebar
export function AffiliateSidebar({ limit = 5 }: { limit?: number }) {
  return (
    <div className="affiliate-sidebar">
      <h4 className="text-sm font-medium mb-3">⚡ Quick Picks</h4>
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
  const product = PLACEHOLDER_PRODUCTS[0];

  if (!product) return null;

  return (
    <div 
      className="featured-affiliate p-6 border border-border rounded-xl bg-card cursor-pointer hover:bg-accent transition-colors"
      onClick={() => window.open(`/api/affiliate/${product.slug}`, '_blank')}
    >
      <div className="featured-badge text-xs font-medium text-primary mb-2">⭐ Editor's Pick</div>
      <img src={product.image_url || ''} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4" />
      <div className="featured-content">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
        <div className="featured-price flex items-center gap-3 mt-3 text-sm">
          {product.rating && <span>⭐ {product.rating}/5</span>}
          {product.regular_price && <span className="font-medium">${product.regular_price}/mo</span>}
        </div>
        <button className="mt-4 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
          Try Free →
        </button>
      </div>
    </div>
  )
}

// Newsletter affiliate section
export function NewsletterAffiliateSection() {
  return (
    <div className="newsletter-affiliates">
      <h3 className="text-lg font-semibold mb-4">🛠️ Tools I Use Daily</h3>
      <AffiliateProducts 
        category="ai_tool" 
        limit={3} 
        source="newsletter"
        layout="list"
      />
    </div>
  )
}

export default AffiliateProducts
