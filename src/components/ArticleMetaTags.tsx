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

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{`${title} | ${siteName}`}</title>
      <meta name="title" content={`${title} | ${siteName}`} />
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={articleUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="article:published_time" content={publishedDate} />
      <meta property="article:author" content={author} />
      <meta property="article:section" content={topic} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={articleUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
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
