// Type definitions for Surface Analytics
interface EventData {
  type: string;
  visitor: string;
  metadata: string;
  timestamp: string;
}

interface SurfaceAnalytics {
  track: (eventType: string, metadata?: Record<string, any>) => EventData;
  identify: (userId: string, traits?: Record<string, any>) => EventData;
  pageView: (pageData?: Record<string, any>) => EventData;
  reset: () => void;
}

declare global {
  interface Window {
    SurfaceAnalytics?: SurfaceAnalytics;
  }
} 