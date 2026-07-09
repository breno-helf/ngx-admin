import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreModule } from './core.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CoreModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, CoreModule.forRoot()],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should instantiate', () => {
    expect(TestBed.inject(CoreModule)).toBeTruthy();
  });
});
