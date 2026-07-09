import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';

import { DsButtonComponent } from './ds-button.component';

describe('DsButtonComponent', () => {
  let fixture: ComponentFixture<DsButtonComponent>;
  let component: DsButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatButtonModule],
      declarations: [DsButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('maps semantic variants to Material colors', () => {
    component.variant = 'primary';
    expect(component.color).toBe('primary');
    component.variant = 'secondary';
    expect(component.color).toBe('accent');
    component.variant = 'danger';
    expect(component.color).toBe('warn');
  });

  it('emits pressed when enabled', () => {
    const spy = jasmine.createSpy('pressed');
    component.pressed.subscribe(spy);
    component.onClick(new MouseEvent('click'));
    expect(spy).toHaveBeenCalled();
  });

  it('does not emit pressed when disabled', () => {
    const spy = jasmine.createSpy('pressed');
    component.disabled = true;
    component.pressed.subscribe(spy);
    component.onClick(new MouseEvent('click'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders a filled button by default', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.classList).toContain('mat-raised-button');
  });
});
