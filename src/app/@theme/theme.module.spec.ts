import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ThemeModule } from './theme.module';

describe('ThemeModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ThemeModule.forRoot()],
    }).compileComponents();
  });

  it('should instantiate', () => {
    expect(TestBed.inject(ThemeModule)).toBeTruthy();
  });
});
