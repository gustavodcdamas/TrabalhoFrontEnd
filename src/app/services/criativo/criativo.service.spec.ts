import { TestBed } from '@angular/core/testing';

import { CriativoService } from './criativo.service';

describe('CriativoService', () => {
  let service: CriativoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CriativoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
