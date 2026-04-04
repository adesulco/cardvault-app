'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to arbitrary analytics endpoint natively for CI dashboards
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify(metric),
    }).catch(() => {});
  });
  return null;
}
