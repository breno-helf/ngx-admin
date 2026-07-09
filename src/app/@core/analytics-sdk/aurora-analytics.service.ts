import { Inject, Injectable, Optional } from '@angular/core';

import {
  AURORA_ANALYTICS_CONFIG,
  AuroraAnalyticsConfig,
  AuroraAnalyticsEvent,
  AuroraUserTraits,
} from './analytics-sdk.model';

const DEFAULT_CONFIG: AuroraAnalyticsConfig = {
  writeKey: 'demo-write-key',
  appId: 'aurora-digital-banking',
  dryRun: true,
  flushAt: 20,
};

/**
 * Client for Aurora Insights, the bank's proprietary product-analytics SDK.
 *
 * This is a self-contained stand-in for the real vendored SDK: it exposes the
 * same surface (`identify` / `page` / `track` / `flush`) and buffers events in
 * memory. In `dryRun` mode (the default for the demo) events are logged rather
 * than delivered over the network.
 */
@Injectable()
export class AuroraAnalyticsService {
  private readonly config: AuroraAnalyticsConfig;
  private readonly queue: AuroraAnalyticsEvent[] = [];
  private traits: AuroraUserTraits | null = null;

  constructor(@Optional() @Inject(AURORA_ANALYTICS_CONFIG) config: AuroraAnalyticsConfig | null) {
    this.config = { ...DEFAULT_CONFIG, ...(config ?? {}) };
  }

  /** Associate subsequent events with a user. */
  identify(traits: AuroraUserTraits): void {
    this.traits = traits;
    this.track('identify', { userId: traits.userId, segment: traits.segment });
  }

  /** Record a screen/route view. */
  page(name: string, properties: Record<string, unknown> = {}): void {
    this.track('page_view', { name, ...properties });
  }

  /** Enqueue a custom analytics event, flushing when the buffer is full. */
  track(name: string, properties: Record<string, unknown> = {}): void {
    this.queue.push({
      name,
      properties: { ...properties, userId: this.traits?.userId },
      timestamp: Date.now(),
    });

    if (this.queue.length >= (this.config.flushAt ?? DEFAULT_CONFIG.flushAt!)) {
      this.flush();
    }
  }

  /** Deliver (or, in dry-run, log) all buffered events and empty the buffer. */
  flush(): AuroraAnalyticsEvent[] {
    const batch = this.queue.splice(0, this.queue.length);

    if (batch.length && this.config.dryRun) {
      // eslint-disable-next-line no-console
      console.debug(`[AuroraInsights:${this.config.appId}] flushing ${batch.length} event(s)`, batch);
    }

    // A real implementation would POST `batch` to the ingestion endpoint here.
    return batch;
  }

  /** Number of events currently buffered (primarily for diagnostics/tests). */
  get pendingCount(): number {
    return this.queue.length;
  }
}
