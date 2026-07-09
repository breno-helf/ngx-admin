import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreModule } from './core.module';

describe('CoreModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, CoreModule.forRoot()],
    }).compileComponents();
  });

  it('should instantiate', () => {
    expect(TestBed.inject(CoreModule)).toBeTruthy();
  });
});
