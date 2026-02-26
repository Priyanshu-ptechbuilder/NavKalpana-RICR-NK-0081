import React from 'react';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import AnalyticsDashboard from './AnalyticsDashboard';

/**
 * Analytics route: wraps with AnalyticsProvider for centralized state
 * and real-time sync. Renders the full Part 2 – Analytics, Monitoring & Growth Intelligence module.
 */
export default function Analytics() {
  return (
    <AnalyticsProvider>
      <AnalyticsDashboard />
    </AnalyticsProvider>
  );
}
