import { Helmet } from 'react-helmet-async';

interface ArticleMetaTagsProps {
  title: string;
  description: string;
  imageUrl: string;
  articleId: string;
  author?: string;
  publishedAt?: string;
  topic?: string;
  tags?: string[];
}

export const ArticleMetaTags = ({
  title,
  description,
  imageUrl,
  articleId,
  author = "NOOZ.NEWS Staff",
  publishedAt,
  topic = "News",
  tags = [],
}: ArticleMetaTagsProps) => {
  const siteUrl = "https://nooz.news";
  const articleUrl = `${siteUrl}/article/${articleId}`;
  const siteName = "NOOZ.NEWS";
  const defaultImage = `${siteUrl}/og-image.png`;
  const image = imageUrl || defaultImage;
  const publishedDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
  const keywords = tags.length > 0 ? tags.join(", ") : topic;

  // Truncate title to optimal 50-60 characters for social sharing
  const truncatedTitle = title.length > 55 ? title.substring(0, 52) + "..." : title;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{`${truncatedTitle} | ${siteName}`}</title>
      <meta name="title" content={`${truncatedTitle} | ${siteName}`} />
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <meta name="keywords" content={keywords} />
      
      {/* Facebook Ad Account */}
      <meta property="fb:app_id" content="911566732049336" />
      
      {/* Open Graph / Facebook - Order: image, url, title, description */}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={articleUrl} />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={siteName} />
      <meta property="article:published_time" content={publishedDate} />
      <meta property="article:author" content={author} />
      <meta property="article:section" content={topic} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={articleUrl} />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@NoozNews" />
      
      {/* Canonical */}
      <link rel="canonical" href={articleUrl} />
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": title,
          "image": [image],
          "datePublished": publishedDate,
          "dateModified": publishedDate,
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/favicon.png`
            }
          },
          "description": description,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleUrl
          }
        })}
      </script>
    </Helmet>
  );
};
