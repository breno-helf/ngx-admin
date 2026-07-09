import { fakeAsync, tick } from '@angular/core/testing';

import { AccountAggregationProvider } from './account-aggregation.provider';
import { CreditBureauProvider } from './credit-bureau.provider';
import { MarketDataProvider } from './market-data.provider';
import { AccountBalance, CreditScore, LinkedAccount, MarketQuote } from './financial-data.model';

describe('financial data providers', () => {
  it('AccountAggregationProvider returns linked accounts and balances', fakeAsync(() => {
    const provider = new AccountAggregationProvider();

    let accounts: LinkedAccount[] | undefined;
    provider.getLinkedAccounts().subscribe(a => (accounts = a));
    tick(500);
    expect(accounts!.length).toBeGreaterThan(0);

    let balance: AccountBalance | undefined;
    provider.getBalances(accounts![0].id).subscribe(b => (balance = b));
    tick(500);
    expect(balance!.accountId).toBe(accounts![0].id);
    expect(balance!.available).toBeLessThanOrEqual(balance!.current);
  }));

  it('MarketDataProvider returns deterministic quotes', fakeAsync(() => {
    const provider = new MarketDataProvider();

    let first: MarketQuote | undefined;
    provider.getQuote('acme').subscribe(q => (first = q));
    tick(300);

    let second: MarketQuote | undefined;
    provider.getQuote('acme').subscribe(q => (second = q));
    tick(300);

    expect(first!.symbol).toBe('ACME');
    expect(first!.price).toBe(second!.price);
  }));

  it('CreditBureauProvider maps scores to bands', fakeAsync(() => {
    const provider = new CreditBureauProvider();

    let score: CreditScore | undefined;
    provider.getCreditScore('cust-123').subscribe(s => (score = s));
    tick(500);

    expect(score!.score).toBeGreaterThanOrEqual(500);
    expect(score!.score).toBeLessThan(850);
    expect(['poor', 'fair', 'good', 'very_good', 'excellent']).toContain(score!.band);
  }));
});
