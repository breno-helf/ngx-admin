import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NbThemeModule } from '@nebular/theme';
import { MapsModule } from './maps.module';

describe('MapsModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NbThemeModule.forRoot(), MapsModule],
    }).compileComponents();
  });

  it('should instantiate', () => {
    expect(TestBed.inject(MapsModule)).toBeTruthy();
  });
});
