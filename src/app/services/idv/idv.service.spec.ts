import { TestBed } from '@angular/core/testing';

import { IdvService } from './idv.service';

describe('IdvService', () => {
  let service: IdvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
