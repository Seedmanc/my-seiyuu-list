import { TestBed, inject } from '@angular/core/testing';

import { SeiyuuService } from './seiyuu.service';
import {RestService} from "./rest.service";
import {HttpClientModule} from "@angular/common/http";
import {MessagesService} from "./messages.service";
import {RoutingService} from "./routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {AnimeService} from "./anime.service";

describe('SeiyuuService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeiyuuService, RestService, MessagesService, RoutingService , AnimeService ],
      imports:[HttpClientModule, RouterTestingModule ]
    });
  });

  it('should be created', inject([SeiyuuService], (service: SeiyuuService) => {
    expect(service).toBeTruthy();
  }));
});
