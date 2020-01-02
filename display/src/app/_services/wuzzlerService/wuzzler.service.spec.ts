import { TestBed } from '@angular/core/testing';

import { WuzzlerService } from './wuzzler.service';

describe('WuzzlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WuzzlerService = TestBed.get(WuzzlerService);
    expect(service).toBeTruthy();
  });
});
  