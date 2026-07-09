import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NbThemeModule } from '@nebular/theme';
import { ChartsModule } from './charts.module';

describe('ChartsModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NbThemeModule.forRoot(), ChartsModule],
    }).compileComponents();
  });

  it('should instantiate', () => {
    expect(TestBed.inject(ChartsModule)).toBeTruthy();
  });
});
