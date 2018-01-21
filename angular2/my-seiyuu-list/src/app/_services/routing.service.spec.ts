import { TestBed, inject } from '@angular/core/testing';
import {RoutingService} from "./routing.service";
import {RouterTestingModule} from "@angular/router/testing";

describe('RoutingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoutingService],
      imports: [RouterTestingModule],
    });
  });

  it('should be created', inject([RoutingService], (service: RoutingService) => {
    expect(RoutingService).toBeTruthy();
  }));
});
