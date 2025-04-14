import { TestBed } from '@angular/core/testing';

import { InstitucionalService } from './institucional.service';

describe('InstitucionalService', () => {
  let service: InstitucionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstitucionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
