import { InjectionToken } from '@angular/core';

/** Traits describing the currently identified end user. */
export interface AuroraUserTraits {
  userId: string;
  segment?: 'retail' | 'wealth' | 'business';
  [key: string]: unknown;
}

/** A single analytics event queued for delivery to the insights backend. */
export interface AuroraAnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

/** Runtime configuration for the proprietary analytics SDK. */
export interface AuroraAnalyticsConfig {
  /** Write key identifying the property in the analytics backend. */
  writeKey: string;
  /** Product/app surface reported alongside every event. */
  appId: string;
  /** Disable network delivery (used in non-prod/demo). Defaults to true. */
  dryRun?: boolean;
  /** Number of events buffered before an automatic flush. */
  flushAt?: number;
}

export const AURORA_ANALYTICS_CONFIG = new InjectionToken<AuroraAnalyticsConfig>('AURORA_ANALYTICS_CONFIG');
