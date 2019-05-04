import {TestBed, inject, fakeAsync, tick, discardPeriodicTasks, getTestBed} from '@angular/core/testing';

import { SeiyuuService } from '../seiyuu.service';
import {MessagesService} from "../messages.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {env} from "../../../environments/environment";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import {basicList, mockList} from "./seiyuu.service.spec";

describe('zSeiyuuService', () => {
  let x;
  let injector: TestBed;
  let service: SeiyuuService;
  let backend: HttpTestingController;

  beforeEach(() => {
    x = undefined;
    TestBed.configureTestingModule({
      providers: [ MessagesService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports:[HttpClientTestingModule ]
    });
    injector = getTestBed();
    service = injector.get(SeiyuuService);
    backend = injector.get(HttpTestingController);
  });
  afterEach(() => {
    backend.verify({ ignoreCancelled: true});
  });

   xit('should report if loading the brief list fails with 404',
     inject([ MessagesService],
       ( msgSvc:MessagesService) => {
         let spy = spyOn(msgSvc, 'error');

         expect(service.pending).toBeTruthy();

         service.totalList$.subscribe(data => x = data);

         mockList(backend, '', {status: 404, statusText: 'Not Found'});

         expect(x).toBeFalsy();
         expect(service.pending).toBeFalsy();
         expect(spy).toHaveBeenCalledWith('Error getting cached list: 404');
       })
   );

  xit('should report if loading the brief list fails with a network error',
     inject([ MessagesService],
       (  msgSvc:MessagesService) => {
         let spy = spyOn(msgSvc, 'error');
         let x;

         expect(service.pending).toBeTruthy();

         service.totalList$
           .subscribe(r => x=r);

         mockList(backend, null, { });

         expect(x).toBeFalsy();
         expect(service.pending).toBeFalsy();
         expect(spy).toHaveBeenCalledWith('Error getting cached list: 0');
       })
   );

   it('should report if loading details fails with 500', fakeAsync(
     inject([ MessagesService],
       (  msgSvc:MessagesService) => {
         let spy = spyOn(msgSvc, 'error');

         mockList(backend, basicList);

         service.requestUpdate(53);
         tick(200);

         backend.expectOne({
           url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&q={"_id":{"$in":[53]}}`,
           method:'GET'
         }, 'GET to load seiyuu details').flush('', {status: 500, statusText: 'Bad Request'});

         expect(spy).toHaveBeenCalledWith('Error loading seiyuu details: 500');
         discardPeriodicTasks();
       })
   ));
});
