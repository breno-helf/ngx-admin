import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NbThemeModule } from '@nebular/theme';
import { TablesModule } from './tables.module';

describe('TablesModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NbThemeModule.forRoot(), TablesModule],
    }).compileComponents();
  });

  it('should instantiate', () => {
    expect(TestBed.inject(TablesModule)).toBeTruthy();
  });
});
