 // Dynamic quota balancing system for maintaining 68/32 content ratio
 
 import { ContentCategory, DEFAULT_RATIOS, BASE_ARTICLES_PER_SCRAPE } from './config.ts';
 
 export interface CategoryQuota {
   category: ContentCategory;
   targetRatio: number;
   currentRatio: number;
   currentCount: number;
   quota: number;
   priority: number;
   isUnderrepresented: boolean;
 }
 
 export interface CategoryDistribution {
   category: ContentCategory;
   count: number;
   ratio: number;
 }
 
 export interface BalancerResult {
   quotas: CategoryQuota[];
   totalArticles: number;
   deviationAlert: boolean;
   recommendations: string[];
 }
 
 /**
  * Calculate the current distribution of articles by category
  */
 export function calculateDistribution(
   categoryCounts: Map<ContentCategory, number>
 ): CategoryDistribution[] {
   const total = Array.from(categoryCounts.values()).reduce((sum, count) => sum + count, 0);
   
   return DEFAULT_RATIOS.map(config => {
     const count = categoryCounts.get(config.category) || 0;
     const ratio = total > 0 ? count / total : 0;
     
     return {
       category: config.category,
       count,
       ratio
     };
   });
 }
 
 /**
  * Calculate quotas for each category based on current distribution and targets
  */
 export function calculateQuotas(
   currentDistribution: CategoryDistribution[],
   baseQuota: number = BASE_ARTICLES_PER_SCRAPE
 ): BalancerResult {
   const quotas: CategoryQuota[] = [];
   const recommendations: string[] = [];
   let deviationAlert = false;
   
   const totalArticles = currentDistribution.reduce((sum, d) => sum + d.count, 0);
   
   for (const config of DEFAULT_RATIOS) {
     const current = currentDistribution.find(d => d.category === config.category);
     const currentRatio = current?.ratio || 0;
     const currentCount = current?.count || 0;
     
     // Calculate deviation from target
     const deviation = config.targetRatio - currentRatio;
     const isUnderrepresented = deviation > 0;
     
     // Check if deviation exceeds 5% threshold
     if (Math.abs(deviation) > 0.05) {
       deviationAlert = true;
       recommendations.push(
         `${config.category.toUpperCase()}: ${isUnderrepresented ? 'INCREASE' : 'DECREASE'} scraping. ` +
         `Current: ${(currentRatio * 100).toFixed(1)}%, Target: ${(config.targetRatio * 100).toFixed(1)}%`
       );
     }
     
     // Calculate adjustment factor (amplified correction)
     // If underrepresented, increase quota; if overrepresented, decrease
     const adjustmentFactor = 1 + (deviation * 3); // Amplify by 3x for faster correction
     
     // Calculate base quota for this category
     const categoryBaseQuota = Math.round(baseQuota * config.targetRatio);
     
     // Apply adjustment
     const adjustedQuota = Math.max(1, Math.round(categoryBaseQuota * adjustmentFactor));
     
     // Priority based on how underrepresented the category is
     // Higher priority = should scrape first
     const priority = Math.max(0, deviation * 100);
     
     quotas.push({
       category: config.category,
       targetRatio: config.targetRatio,
       currentRatio,
       currentCount,
       quota: adjustedQuota,
       priority,
       isUnderrepresented
     });
   }
   
   // Sort by priority (underrepresented categories first)
   quotas.sort((a, b) => b.priority - a.priority);
   
   return {
     quotas,
     totalArticles,
     deviationAlert,
     recommendations
   };
 }
 
 /**
  * Check if a category has remaining quota
  */
 export function hasRemainingQuota(
   category: ContentCategory,
   scraped: Map<ContentCategory, number>,
   quotas: CategoryQuota[]
 ): boolean {
   const quota = quotas.find(q => q.category === category);
   if (!quota) return false;
   
   const scrapedCount = scraped.get(category) || 0;
   return scrapedCount < quota.quota;
 }
 
 /**
  * Get the remaining quota for a category
  */
 export function getRemainingQuota(
   category: ContentCategory,
   scraped: Map<ContentCategory, number>,
   quotas: CategoryQuota[]
 ): number {
   const quota = quotas.find(q => q.category === category);
   if (!quota) return 0;
   
   const scrapedCount = scraped.get(category) || 0;
   return Math.max(0, quota.quota - scrapedCount);
 }
 
 /**
  * Record a scraped article and update counts
  */
 export function recordScrapedArticle(
   category: ContentCategory,
   scraped: Map<ContentCategory, number>
 ): void {
   const current = scraped.get(category) || 0;
   scraped.set(category, current + 1);
 }
 
 /**
  * Calculate the alignment score for ranking purposes
  * Articles that help achieve target ratio get higher scores
  */
 export function calculateAlignmentScore(
   category: ContentCategory,
   currentDistribution: CategoryDistribution[]
 ): number {
   const config = DEFAULT_RATIOS.find(r => r.category === category);
   const current = currentDistribution.find(d => d.category === category);
   
   if (!config || !current) return 50; // Default neutral score
   
   const deviation = config.targetRatio - current.ratio;
   
   // If underrepresented, give bonus (up to 100)
   if (deviation > 0) {
     return Math.min(100, 50 + deviation * 200);
   }
   
   // If overrepresented, penalize (down to 0)
   return Math.max(0, 50 + deviation * 200);
 }