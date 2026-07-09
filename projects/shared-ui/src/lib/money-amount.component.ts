import { Component, Input } from '@angular/core';

/**
 * Renders a monetary value with consistent locale/currency formatting.
 * Part of the shared component library consumed by downstream product teams.
 */
@Component({
  selector: 'aui-money-amount',
  template: `<span class="aui-money" [class.aui-money--negative]="amount < 0">{{ formatted }}</span>`,
  styles: [
    `.aui-money { font-variant-numeric: tabular-nums; }`,
    `.aui-money--negative { color: #d32f2f; }`,
  ],
})
export class MoneyAmountComponent {
  @Input() amount = 0;
  @Input() currency = 'USD';
  @Input() locale = 'en-US';

  get formatted(): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}
