import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NbThemeModule } from '@nebular/theme';
import { EditorsModule } from './editors.module';

describe('EditorsModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NbThemeModule.forRoot(), EditorsModule],
    }).compileComponents();
  });

  it('should instantiate', () => {
    expect(TestBed.inject(EditorsModule)).toBeTruthy();
  });
});
