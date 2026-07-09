import { ModuleWithProviders, NgModule } from '@angular/core';

import { AURORA_ANALYTICS_CONFIG, AuroraAnalyticsConfig } from './analytics-sdk.model';
import { AuroraAnalyticsService } from './aurora-analytics.service';

/**
 * Wraps the proprietary Aurora Insights analytics SDK as an Angular module.
 * Configure once at the app root via `AuroraAnalyticsSdkModule.forRoot({...})`.
 */
@NgModule()
export class AuroraAnalyticsSdkModule {
  static forRoot(config: AuroraAnalyticsConfig): ModuleWithProviders<AuroraAnalyticsSdkModule> {
    return {
      ngModule: AuroraAnalyticsSdkModule,
      providers: [
        { provide: AURORA_ANALYTICS_CONFIG, useValue: config },
        AuroraAnalyticsService,
      ],
    };
  }
}
