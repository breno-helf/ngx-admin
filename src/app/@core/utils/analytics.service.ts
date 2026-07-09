import { Injectable, Optional } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

import { AuroraAnalyticsService } from '../analytics-sdk/aurora-analytics.service';

declare const ga: any;

@Injectable()
export class AnalyticsService {
  private enabled: boolean;

  constructor(
    private location: Location,
    private router: Router,
    @Optional() private aurora: AuroraAnalyticsService | null,
  ) {
    this.enabled = false;
  }

  trackPageViews() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    )
      .subscribe(() => {
        const path = this.location.path();
        this.aurora?.page(path);
        if (this.enabled) {
          ga('send', {hitType: 'pageview', page: path});
        }
      });
  }

  trackEvent(eventName: string) {
    this.aurora?.track(eventName);
    if (this.enabled) {
      ga('send', 'event', eventName);
    }
  }
}
