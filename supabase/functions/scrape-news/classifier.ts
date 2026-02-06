 // Content classification system with keyword-based categorization
 
 import { ContentCategory, CATEGORY_KEYWORDS } from './config.ts';
 
 export interface ClassificationResult {
   category: ContentCategory;
   subCategory: string;
   confidence: number;
   matchedKeywords: string[];
 }
 
 interface CategoryScore {
   category: ContentCategory;
   subCategory: string;
   score: number;
   matches: string[];
 }
 
 /**
  * Classify article content into categories based on keyword matching
  * Title matches are weighted 2x compared to description matches
  */
 export function classifyArticle(title: string, description: string): ClassificationResult {
   const normalizedTitle = title.toLowerCase();
   const normalizedDescription = description.toLowerCase();
   const allText = `${normalizedTitle} ${normalizedDescription}`;
   
   const scores: CategoryScore[] = [];
   
   // Score each category and subcategory
   for (const [category, subcategories] of Object.entries(CATEGORY_KEYWORDS)) {
     for (const [subCategory, keywords] of Object.entries(subcategories)) {
       let score = 0;
       const matches: string[] = [];
       
       for (const keyword of keywords) {
         const keywordLower = keyword.toLowerCase();
         
         // Title matches are worth 2x
         if (normalizedTitle.includes(keywordLower)) {
           score += 2;
           if (!matches.includes(keyword)) {
             matches.push(keyword);
           }
         }
         
         // Description matches are worth 1x
         if (normalizedDescription.includes(keywordLower)) {
           score += 1;
           if (!matches.includes(keyword)) {
             matches.push(keyword);
           }
         }
       }
       
       if (score > 0) {
         scores.push({
           category: category as ContentCategory,
           subCategory,
           score,
           matches
         });
       }
     }
   }
   
   // Sort by score descending
   scores.sort((a, b) => b.score - a.score);
   
   // If no matches, default to tech with low confidence
   if (scores.length === 0) {
     return {
       category: 'tech',
       subCategory: 'general',
       confidence: 0.3,
       matchedKeywords: []
     };
   }
   
   const topScore = scores[0];
   const secondScore = scores[1]?.score || 0;
   
   // Calculate confidence based on score differential
   // Higher differential = higher confidence
   const scoreDiff = topScore.score - secondScore;
   const maxPossibleScore = topScore.score + secondScore + 1;
   let confidence = Math.min(0.99, 0.5 + (scoreDiff / maxPossibleScore) * 0.5);
   
   // Boost confidence for high absolute scores
   if (topScore.score >= 5) {
     confidence = Math.min(0.99, confidence + 0.1);
   }
   if (topScore.score >= 10) {
     confidence = Math.min(0.99, confidence + 0.1);
   }
   
   return {
     category: topScore.category,
     subCategory: topScore.subCategory,
     confidence: Math.round(confidence * 100) / 100,
     matchedKeywords: topScore.matches.slice(0, 10) // Limit to 10 keywords
   };
 }
 
 /**
  * Check if an article matches a specific category based on source or content
  */
 export function matchesCategory(
   classification: ClassificationResult,
   targetCategory: ContentCategory
 ): boolean {
   return classification.category === targetCategory;
 }
 
 /**
  * Get the primary category from source metadata if available
  */
export function getSourceCategory(sourceName: string, sourceCategory?: ContentCategory): ContentCategory | null {
  if (sourceCategory) {
    return sourceCategory;
  }
  
  // Fallback: try to infer from source name
  const lowerName = sourceName.toLowerCase();
  
  // Check video games first (more specific)
  if (lowerName.includes('gaming') || lowerName.includes('polygon') || lowerName.includes('ign') ||
      lowerName.includes('eurogamer') || lowerName.includes('kotaku') || lowerName.includes('gamespot') ||
      lowerName.includes('pc gamer')) {
    return 'video_games';
  }
  
  if (lowerName.includes('tech') || lowerName.includes('wired') || lowerName.includes('verge') || 
      lowerName.includes('ars') || lowerName.includes('engadget') || lowerName.includes('cnet')) {
    return 'tech';
  }
  
  if (lowerName.includes('bloomberg') || lowerName.includes('wsj') || lowerName.includes('financial') ||
      lowerName.includes('cnbc') || lowerName.includes('market')) {
    return 'finance';
  }
  
  if (lowerName.includes('politico') || lowerName.includes('hill') || lowerName.includes('politics')) {
    return 'politics';
  }
  
  if (lowerName.includes('climate') || lowerName.includes('environment') || lowerName.includes('e360')) {
    return 'climate';
  }
  
  return null;
}