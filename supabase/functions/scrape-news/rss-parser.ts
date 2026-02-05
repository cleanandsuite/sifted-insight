 // Native RSS/Atom feed parser using Deno's DOM parser
 // deno-lint-ignore-file no-explicit-any
 
 import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.47/deno-dom-wasm.ts";
 
 export interface FeedItem {
   title: string;
   link: string;
   description: string;
   pubDate: string | null;
   author: string | null;
   imageUrl: string | null;
   guid: string | null;
 }
 
 export interface ParsedFeed {
   title: string;
   items: FeedItem[];
   feedType: 'rss' | 'atom';
 }
 
 /**
  * Fetch and parse an RSS or Atom feed from a URL
  */
 export async function fetchAndParseFeed(url: string): Promise<ParsedFeed | null> {
   try {
     const response = await fetch(url, {
       headers: {
         'User-Agent': 'SIFT-NewsBot/1.0 (https://sifted-insight.lovable.app)',
         'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
       }
     });
     
     if (!response.ok) {
       console.error(`Failed to fetch feed ${url}: ${response.status}`);
       return null;
     }
     
     const xml = await response.text();
     return parseFeed(xml);
   } catch (error) {
     console.error(`Error fetching feed ${url}:`, error);
     return null;
   }
 }
 
 /**
  * Parse RSS or Atom XML into structured feed data
  */
 export function parseFeed(xml: string): ParsedFeed | null {
   try {
     const parser = new DOMParser();
     const doc = parser.parseFromString(xml, 'text/xml');
     
     if (!doc) {
       console.error('Failed to parse XML');
       return null;
     }
     
     // Check for parse errors
     const parseError = doc.querySelector('parsererror');
     if (parseError) {
       console.error('XML parse error:', parseError.textContent);
       return null;
     }
     
     // Detect feed type and parse accordingly
     const rssChannel = doc.querySelector('rss > channel, channel');
     const atomFeed = doc.querySelector('feed');
     
     if (rssChannel) {
       return parseRSSFeed(doc, rssChannel);
     } else if (atomFeed) {
       return parseAtomFeed(doc, atomFeed);
     }
     
     console.error('Unknown feed format');
     return null;
   } catch (error) {
     console.error('Error parsing feed:', error);
     return null;
   }
 }
 
 /**
  * Parse RSS 2.0 feed
  */
 function parseRSSFeed(doc: any, channel: any): ParsedFeed {
   const title = getTextContent(channel, 'title') || 'Unknown Feed';
   const items: FeedItem[] = [];
   
   const itemElements = channel.querySelectorAll('item');
   
   for (let i = 0; i < itemElements.length; i++) {
     const item = itemElements[i];
     const itemTitle = getTextContent(item, 'title');
     const link = getTextContent(item, 'link') || getTextContent(item, 'guid');
     
     if (!itemTitle || !link) continue;
     
     // Extract image from various sources
     let imageUrl = getMediaContent(item) || 
                    getEnclosure(item) || 
                    getImageFromContent(item);
     
     items.push({
       title: sanitizeText(itemTitle),
       link: sanitizeUrl(link),
       description: sanitizeText(getTextContent(item, 'description') || ''),
       pubDate: getTextContent(item, 'pubDate'),
       author: getTextContent(item, 'author') || getTextContent(item, 'dc:creator'),
       imageUrl,
       guid: getTextContent(item, 'guid')
     });
   }
   
   return { title, items, feedType: 'rss' };
 }
 
 /**
  * Parse Atom feed
  */
 function parseAtomFeed(doc: any, feed: any): ParsedFeed {
   const title = getTextContent(feed, 'title') || 'Unknown Feed';
   const items: FeedItem[] = [];
   
   const entries = feed.querySelectorAll('entry');
   
   for (let i = 0; i < entries.length; i++) {
     const entry = entries[i];
     const entryTitle = getTextContent(entry, 'title');
     const link = getAtomLink(entry);
     
     if (!entryTitle || !link) continue;
     
     // Get content/summary
     const content = getTextContent(entry, 'content') || 
                     getTextContent(entry, 'summary') || '';
     
     // Extract image from content or media
     const imageUrl = getMediaContent(entry) || getImageFromContent(entry);
     
     items.push({
       title: sanitizeText(entryTitle),
       link: sanitizeUrl(link),
       description: sanitizeText(content),
       pubDate: getTextContent(entry, 'published') || getTextContent(entry, 'updated'),
       author: getAtomAuthor(entry),
       imageUrl,
       guid: getTextContent(entry, 'id')
     });
   }
   
   return { title, items, feedType: 'atom' };
 }
 
 /**
  * Get text content from an element
  */
 function getTextContent(parent: any, tagName: string): string | null {
   const element = parent.querySelector(tagName);
   if (!element) return null;
   
   // Handle CDATA
   let text = element.textContent || '';
   text = text.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
   return text.trim() || null;
 }
 
 /**
  * Get Atom link (prefer alternate, then self)
  */
 function getAtomLink(entry: any): string | null {
   const links = entry.querySelectorAll('link');
   
   for (let i = 0; i < links.length; i++) {
     const link = links[i];
     const rel = link.getAttribute('rel');
     if (rel === 'alternate' || !rel) {
       return link.getAttribute('href');
     }
   }
   
   // Fallback to first link
   return links[0]?.getAttribute('href') || null;
 }
 
 /**
  * Get Atom author name
  */
 function getAtomAuthor(entry: any): string | null {
   const author = entry.querySelector('author');
   if (!author) return null;
   return getTextContent(author, 'name');
 }
 
 /**
  * Get media:content or media:thumbnail URL
  */
 function getMediaContent(item: any): string | null {
   // Try media:content
   const mediaContent = item.querySelector('media\\:content, content[medium="image"]');
   if (mediaContent) {
     return mediaContent.getAttribute('url');
   }
   
   // Try media:thumbnail
   const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
   if (mediaThumbnail) {
     return mediaThumbnail.getAttribute('url');
   }
   
   return null;
 }
 
 /**
  * Get enclosure URL (common for podcasts but sometimes used for images)
  */
 function getEnclosure(item: any): string | null {
   const enclosure = item.querySelector('enclosure');
   if (enclosure) {
     const type = enclosure.getAttribute('type') || '';
     if (type.startsWith('image/')) {
       return enclosure.getAttribute('url');
     }
   }
   return null;
 }
 
 /**
  * Extract image URL from HTML content or description
  */
 function getImageFromContent(item: any): string | null {
   const content = getTextContent(item, 'content:encoded') || 
                   getTextContent(item, 'description') || 
                   getTextContent(item, 'content') || '';
   
   // Try to find <img src="...">
   const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
   if (imgMatch) {
     return imgMatch[1];
   }
   
   return null;
 }
 
 /**
  * Sanitize text by removing HTML tags and control characters
  */
 function sanitizeText(text: string): string {
   return text
     .replace(/<[^>]*>/g, '') // Remove HTML tags
     .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
     .replace(/&nbsp;/g, ' ')
     .replace(/&amp;/g, '&')
     .replace(/&lt;/g, '<')
     .replace(/&gt;/g, '>')
     .replace(/&quot;/g, '"')
     .replace(/&#39;/g, "'")
     .trim();
 }
 
 /**
  * Sanitize URL
  */
 function sanitizeUrl(url: string): string {
   try {
     const parsed = new URL(url.trim());
     return parsed.href;
   } catch {
     return url.trim();
   }
 }