import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule} from "@angular/common/http";

import { RestService } from './rest.service';

describe('RestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestService],
      imports: [
        HttpClientModule,
      ],
    });
  });

  it('should be created', inject([RestService], (service: RestService) => {
    expect(service).toBeTruthy();
  }));
});
