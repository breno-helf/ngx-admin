import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoneyAmountComponent } from './money-amount.component';
import { StatusBadgeComponent } from './status-badge.component';

const COMPONENTS = [MoneyAmountComponent, StatusBadgeComponent];

@NgModule({
  imports: [CommonModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class SharedUiModule {}
