import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CreditScore } from './financial-data.model';

/**
 * Stub for a credit-bureau data provider (e.g. Equifax / Experian /
 * TransUnion). Returns a deterministic mock score for a customer.
 */
@Injectable()
export class CreditBureauProvider {
  readonly providerName = 'credit-bureau-sandbox';
  private readonly latencyMs = 500;

  getCreditScore(customerId: string): Observable<CreditScore> {
    const seed = customerId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const score = 500 + (seed % 350);
    return of<CreditScore>({
      customerId,
      bureau: 'experian',
      score,
      band: this.bandFor(score),
      pulledAt: new Date().toISOString(),
    }).pipe(delay(this.latencyMs));
  }

  private bandFor(score: number): CreditScore['band'] {
    if (score < 580) {
      return 'poor';
    }
    if (score < 670) {
      return 'fair';
    }
    if (score < 740) {
      return 'good';
    }
    if (score < 800) {
      return 'very_good';
    }
    return 'excellent';
  }
}
