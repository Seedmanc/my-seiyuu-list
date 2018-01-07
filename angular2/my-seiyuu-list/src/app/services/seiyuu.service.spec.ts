import { TestBed, inject } from '@angular/core/testing';

import { SeiyuuService } from './seiyuu.service';

describe('SeiyuuService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeiyuuService]
    });
  });

  it('should be created', inject([SeiyuuService], (service: SeiyuuService) => {
    expect(service).toBeTruthy();
  }));
});
