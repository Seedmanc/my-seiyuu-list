import {TestBed, inject, async, fakeAsync, tick, discardPeriodicTasks} from '@angular/core/testing';

import { SeiyuuService } from '../seiyuu.service';
import {RestService} from "../rest.service";
import {HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../messages.service";
import {RoutingService} from "../routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {AnimeService} from "../anime.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {env} from "../../../environments/environment";
import {basicModel, basicModel2, model, model2} from "../../_models/tests/seiyuu.model.spec";
import {BasicSeiyuu, Seiyuu} from "../../_models/seiyuu.model";

fdescribe('SeiyuuService', () => {
  let basicList = [
    basicModel,
    basicModel2
  ];
  let list = [
    model,
    model2
  ];
  let x;
  beforeEach(() => {
    x = undefined;
    TestBed.configureTestingModule({
      providers: [SeiyuuService, RestService, MessagesService, RoutingService , AnimeService ],
      imports:[HttpClientModule, RouterTestingModule, HttpClientTestingModule ]
    });
  });

  it('should be created', inject([SeiyuuService], (service: SeiyuuService) => {
    expect(service).toBeTruthy();
  }));

  it('should on init fetch the record count from seiyuu and anime, toggling pending state and setting status', fakeAsync(
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
      let spy = spyOn(msgSvc, 'status');

      expect(service.pending).toBeTruthy();
      service.totalList$.subscribe(data => x=data);

      backend.expectOne({
        url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"name":1,"hits":1,"updated":1,"count":1,"accessed":1}&s={"name":1}`,
        method:'GET'
      }, 'GET to count the # of records in the seiyuu DB').flush(basicList);
      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&c=true`,
        method:'GET'
      }, 'GET to count the # of records in the anime DB').flush(7);
      tick();
      expect(x).toBeTruthy();
      expect(service.pending).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(basicList.length + ` seiyuu & 7 anime records cached`);

      discardPeriodicTasks()
    })
  ));

  it('should load seiyuu details upon an update request', fakeAsync(
    inject([SeiyuuService, HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
      service.totalList$.subscribe(data => x=data);

      backend.expectOne({
        url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"name":1,"hits":1,"updated":1,"count":1,"accessed":1}&s={"name":1}`,
        method:'GET'
      }, 'GET to count the # of records in the seiyuu DB').flush(basicList);
      tick();
      service.updateRequest$.next(53);
      service.updateRequest$.next(0);
      tick(300);
      backend.expectOne({
        url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&q={"_id":{"$in":[53,0]}}`,
        method:'GET'
      }, 'GET to count the # of records in the seiyuu DB').flush(list);

      expect(JSON.stringify(x)).toBe(JSON.stringify([new Seiyuu(model), new BasicSeiyuu(model2)]));

      discardPeriodicTasks()
    })
  ));

  /*fit('should remove seiyuu from display by id', fakeAsync(
    inject([SeiyuuService, RoutingService],
      (service:SeiyuuService, routingSvc:RoutingService) => {
      let spy = spyOn(routingSvc, 'remove');

      service.removed$.next(53);
      tick();
      expect(spy).toHaveBeenCalledWith(53,[]);
        discardPeriodicTasks()
    })
  ))*/
});
