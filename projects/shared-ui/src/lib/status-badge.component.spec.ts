import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;
  let component: StatusBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('defaults to the neutral tone', () => {
    fixture.detectChanges();
    const badge: HTMLElement = fixture.nativeElement.querySelector('.aui-badge');
    expect(badge.classList).toContain('aui-badge--neutral');
  });

  it('applies the requested tone', () => {
    component.tone = 'success';
    fixture.detectChanges();
    const badge: HTMLElement = fixture.nativeElement.querySelector('.aui-badge');
    expect(badge.classList).toContain('aui-badge--success');
  });
});
