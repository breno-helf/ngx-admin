import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

export type DsButtonVariant = 'primary' | 'secondary' | 'danger';
export type DsButtonAppearance = 'filled' | 'outlined';

/**
 * Design-system button. A thin wrapper over Angular Material's button that
 * exposes the bank's own semantic vocabulary (`variant`) instead of Material's
 * raw `color`/appearance directives, so product code never touches Material
 * APIs directly. This wrapper layer is what an Angular upgrade must keep stable.
 */
@Component({
  selector: 'ds-button',
  templateUrl: './ds-button.component.html',
  styleUrls: ['./ds-button.component.scss'],
})
export class DsButtonComponent {
  @Input() variant: DsButtonVariant = 'primary';
  @Input() appearance: DsButtonAppearance = 'filled';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() pressed = new EventEmitter<MouseEvent>();

  get color(): ThemePalette {
    switch (this.variant) {
      case 'danger':
        return 'warn';
      case 'secondary':
        return 'accent';
      default:
        return 'primary';
    }
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.pressed.emit(event);
    }
  }
}
