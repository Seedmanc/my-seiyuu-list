import { TestBed, inject } from '@angular/core/testing';

import { SorterService } from '../sorter.service';

describe('SorterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SorterService]
    });
  });

  it('should work', inject([SorterService], (service: SorterService) => {
    service.sort('test');
    expect(service.ascending).toBeTruthy();
    expect(service.orderByField).toBe('test');
    service.sort('test');
    expect(service.ascending).toBeFalsy();
    service.sort('another');
    expect(service.ascending).toBeFalsy();
    expect(service.orderByField).toBe('another');
  }));
});
