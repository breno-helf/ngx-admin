import { Component, Input } from '@angular/core';

/**
 * Design-system surface/card. Wraps Angular Material's `mat-card` and projects
 * an optional title/subtitle, isolating product code from Material's card API.
 */
@Component({
  selector: 'ds-card',
  templateUrl: './ds-card.component.html',
  styleUrls: ['./ds-card.component.scss'],
})
export class DsCardComponent {
  @Input() heading?: string;
  @Input() subheading?: string;
}
