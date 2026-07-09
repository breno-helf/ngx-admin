import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: AnalyticsService, useValue: { trackPageViews: () => {} } },
        { provide: SeoService, useValue: { trackCanonicalChanges: () => {} } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should track page views and canonical changes on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const analytics = TestBed.inject(AnalyticsService);
    const seo = TestBed.inject(SeoService);
    spyOn(analytics, 'trackPageViews');
    spyOn(seo, 'trackCanonicalChanges');
    fixture.componentInstance.ngOnInit();
    expect(analytics.trackPageViews).toHaveBeenCalled();
    expect(seo.trackCanonicalChanges).toHaveBeenCalled();
  });
});
