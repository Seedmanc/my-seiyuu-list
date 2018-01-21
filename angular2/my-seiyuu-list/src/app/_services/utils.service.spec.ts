import { TestBed, inject } from '@angular/core/testing';
import "rxjs/Rx";

import {Utils} from "./utils.service";

describe('Utils', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Utils],
      imports: [
      ],
    });
  });

  it('should be created', inject([Utils], (service: Utils) => {
    expect(Utils).toBeTruthy();
  }));
});
