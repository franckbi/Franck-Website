'use client';

import { useEffect } from 'react';

export function WebVitals() {
  useEffect(() => {
    // Only load web vitals in production
    if (process.env.NODE_ENV === 'production') {
      import('web-vitals').then(webVitals => {
        webVitals.onCLS(console.log);
        webVitals.onINP(console.log); // FID is replaced by INP in v5
        webVitals.onFCP(console.log);
        webVitals.onLCP(console.log);
        webVitals.onTTFB(console.log);
      });
    }
  }, []);

  return null;
}
