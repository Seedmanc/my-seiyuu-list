import {TestBed, inject} from '@angular/core/testing';
import { HttpClientModule} from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {AnimeService} from "../anime.service";
import {RestService} from "../rest.service";
import {env} from "../../../environments/environment";
import {MessagesService} from "../messages.service";
import {SeiyuuService} from "../seiyuu.service";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";

describe('AnimeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimeService, RestService, MessagesService, SeiyuuService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports: [
        HttpClientModule, HttpClientTestingModule
      ],
    });
  });

  it('should be created', inject([AnimeService], (service: AnimeService) => {
    expect(service).toBeTruthy();
  }));

  it('should fetch the record count from anime db',
    inject([AnimeService, HttpTestingController], (service:AnimeService, backend:HttpTestingController) => {
      service.animeCount$.subscribe(data => expect(data).toEqual(4286));
      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&c=true`,
        method:'GET'
      }, 'GET to count the # of records in the anime DB').flush(4286);
    })
  )
});