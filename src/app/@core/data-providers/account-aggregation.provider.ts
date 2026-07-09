import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AccountBalance, LinkedAccount } from './financial-data.model';

/**
 * Stub for a bank-account aggregation provider (e.g. Plaid / TrueLayer /
 * MX) used to pull a customer's externally-linked accounts and balances.
 * Returns deterministic mock data; no external calls are made.
 */
@Injectable()
export class AccountAggregationProvider {
  readonly providerName = 'aggregation-sandbox';
  private readonly latencyMs = 400;

  private readonly accounts: LinkedAccount[] = [
    {
      id: 'acc_chk_001',
      institution: 'Aurora Bank',
      displayName: 'Everyday Checking',
      type: 'checking',
      mask: '4821',
      currency: 'USD',
    },
    {
      id: 'acc_sav_002',
      institution: 'Aurora Bank',
      displayName: 'High-Yield Savings',
      type: 'savings',
      mask: '7715',
      currency: 'USD',
    },
    {
      id: 'acc_cc_003',
      institution: 'Meridian Card Services',
      displayName: 'Meridian Rewards Card',
      type: 'credit_card',
      mask: '0093',
      currency: 'USD',
    },
  ];

  getLinkedAccounts(): Observable<LinkedAccount[]> {
    return of(this.accounts).pipe(delay(this.latencyMs));
  }

  getBalances(accountId: string): Observable<AccountBalance> {
    const seed = accountId.length * 137;
    const current = 1000 + (seed % 9000);
    return of<AccountBalance>({
      accountId,
      current,
      available: Math.max(0, current - 250),
      currency: 'USD',
      asOf: new Date().toISOString(),
    }).pipe(delay(this.latencyMs));
  }
}
