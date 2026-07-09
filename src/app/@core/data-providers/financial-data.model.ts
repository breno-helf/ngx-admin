/** Shared domain types for the third-party financial data provider stubs. */

export interface LinkedAccount {
  id: string;
  institution: string;
  displayName: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment';
  mask: string;
  currency: string;
}

export interface AccountBalance {
  accountId: string;
  available: number;
  current: number;
  currency: string;
  asOf: string;
}

export interface MarketQuote {
  symbol: string;
  price: number;
  changePercent: number;
  currency: string;
  asOf: string;
}

export interface CreditScore {
  customerId: string;
  bureau: 'equifax' | 'experian' | 'transunion';
  score: number;
  band: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  pulledAt: string;
}
