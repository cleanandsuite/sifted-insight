 import { useEffect, useRef } from 'react';
 
 interface AdUnitProps {
   slot?: string;
   format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
   className?: string;
 }
 
 declare global {
   interface Window {
     adsbygoogle: unknown[];
   }
 }
 
 export const AdUnit = ({ slot, format = 'auto', className = '' }: AdUnitProps) => {
   const adRef = useRef<HTMLModElement>(null);
   const isAdPushed = useRef(false);
 
   useEffect(() => {
     if (adRef.current && !isAdPushed.current) {
       try {
         (window.adsbygoogle = window.adsbygoogle || []).push({});
         isAdPushed.current = true;
       } catch (e) {
         console.error('AdSense error:', e);
       }
     }
   }, []);
 
   return (
     <ins
       ref={adRef}
       className={`adsbygoogle block ${className}`}
       style={{ display: 'block' }}
       data-ad-client="ca-pub-6389373835787941"
       data-ad-slot={slot}
       data-ad-format={format}
       data-full-width-responsive="true"
     />
   );
 };