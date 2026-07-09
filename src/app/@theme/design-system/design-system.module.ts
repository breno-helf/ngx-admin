import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { DsButtonComponent } from './ds-button/ds-button.component';
import { DsCardComponent } from './ds-card/ds-card.component';

const DS_COMPONENTS = [DsButtonComponent, DsCardComponent];

/**
 * The bank's custom design system, built on top of Angular Material.
 *
 * Product/feature modules import this module and consume the `ds-*` components
 * rather than Material components directly. Centralising the Material surface
 * here is what makes an Angular/Material version bump a contained change.
 */
@NgModule({
  imports: [CommonModule, MatButtonModule, MatCardModule],
  declarations: [...DS_COMPONENTS],
  exports: [...DS_COMPONENTS],
})
export class DesignSystemModule {}
