import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyAmountComponent } from './money-amount.component';

describe('MoneyAmountComponent', () => {
  let fixture: ComponentFixture<MoneyAmountComponent>;
  let component: MoneyAmountComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoneyAmountComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoneyAmountComponent);
    component = fixture.componentInstance;
  });

  it('formats a positive USD amount', () => {
    component.amount = 1234.5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('$1,234.50');
  });

  it('flags negative amounts', () => {
    component.amount = -42;
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('.aui-money');
    expect(span.classList).toContain('aui-money--negative');
  });

  it('honours a non-USD currency', () => {
    component.amount = 10;
    component.currency = 'EUR';
    component.locale = 'de-DE';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('€');
  });
});
