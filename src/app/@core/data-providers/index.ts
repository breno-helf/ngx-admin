export * from './financial-data.model';
export * from './account-aggregation.provider';
export * from './market-data.provider';
export * from './credit-bureau.provider';

import { AccountAggregationProvider } from './account-aggregation.provider';
import { CreditBureauProvider } from './credit-bureau.provider';
import { MarketDataProvider } from './market-data.provider';

/** Convenience bundle of all third-party financial data provider stubs. */
export const FINANCIAL_DATA_PROVIDERS = [
  AccountAggregationProvider,
  MarketDataProvider,
  CreditBureauProvider,
];
