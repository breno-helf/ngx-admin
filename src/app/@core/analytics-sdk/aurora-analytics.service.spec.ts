import { AuroraAnalyticsService } from './aurora-analytics.service';

describe('AuroraAnalyticsService', () => {
  function create(flushAt = 20): AuroraAnalyticsService {
    return new AuroraAnalyticsService({
      writeKey: 'test',
      appId: 'test-app',
      dryRun: true,
      flushAt,
    });
  }

  it('buffers tracked events', () => {
    const sdk = create();
    sdk.track('opened_account');
    sdk.page('dashboard');

    expect(sdk.pendingCount).toBe(2);
  });

  it('stamps events with the identified user', () => {
    const sdk = create();
    sdk.identify({ userId: 'u-1', segment: 'retail' });
    sdk.track('transfer_started');

    const batch = sdk.flush();
    const transfer = batch.find(e => e.name === 'transfer_started');
    expect(transfer!.properties!.userId).toBe('u-1');
  });

  it('auto-flushes when the buffer reaches flushAt', () => {
    const sdk = create(2);
    sdk.track('a');
    expect(sdk.pendingCount).toBe(1);
    sdk.track('b');
    expect(sdk.pendingCount).toBe(0);
  });

  it('empties the buffer on flush', () => {
    const sdk = create();
    sdk.track('a');
    const batch = sdk.flush();

    expect(batch.length).toBe(1);
    expect(sdk.pendingCount).toBe(0);
  });
});
