import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MarketQuote } from './financial-data.model';

/**
 * Stub for a third-party market-data provider (e.g. an equities/FX quotes
 * vendor). Produces deterministic pseudo-quotes for a symbol.
 */
@Injectable()
export class MarketDataProvider {
  readonly providerName = 'market-data-sandbox';
  private readonly latencyMs = 300;

  getQuote(symbol: string): Observable<MarketQuote> {
    return of(this.quoteFor(symbol)).pipe(delay(this.latencyMs));
  }

  getQuotes(symbols: string[]): Observable<MarketQuote[]> {
    return of(symbols.map(s => this.quoteFor(s))).pipe(delay(this.latencyMs));
  }

  private quoteFor(symbol: string): MarketQuote {
    const seed = symbol.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const price = Number((20 + (seed % 480) + (seed % 100) / 100).toFixed(2));
    const changePercent = Number((((seed % 800) - 400) / 100).toFixed(2));
    return {
      symbol: symbol.toUpperCase(),
      price,
      changePercent,
      currency: 'USD',
      asOf: new Date().toISOString(),
    };
  }
}
