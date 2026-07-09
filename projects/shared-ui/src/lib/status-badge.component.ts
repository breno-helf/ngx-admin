import { Component, Input } from '@angular/core';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger';

/**
 * Small status pill used across product surfaces (e.g. transaction states).
 * Part of the shared component library consumed by downstream product teams.
 */
@Component({
  selector: 'aui-status-badge',
  template: `<span class="aui-badge aui-badge--{{ tone }}"><ng-content></ng-content></span>`,
  styles: [
    `.aui-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.4;
    }`,
    `.aui-badge--neutral { background: #eceff1; color: #37474f; }`,
    `.aui-badge--success { background: #e6f4ea; color: #1e7e34; }`,
    `.aui-badge--warning { background: #fff4e5; color: #b26a00; }`,
    `.aui-badge--danger { background: #fdecea; color: #c62828; }`,
  ],
})
export class StatusBadgeComponent {
  @Input() tone: StatusTone = 'neutral';
}
