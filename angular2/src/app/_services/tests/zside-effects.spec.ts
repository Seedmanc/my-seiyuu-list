import {TestBed, inject, fakeAsync, tick, discardPeriodicTasks, getTestBed} from '@angular/core/testing';
import {of} from "rxjs/observable/of";
import { SeiyuuService } from '../seiyuu.service';
import {MessagesService} from "../messages.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {env} from "../../../environments/environment";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import {basicList, mockList} from "./seiyuu.service.spec";
import {PhotoService} from "../photo.service";
import {RestService} from "../rest.service";
import {Subject} from "rxjs/Rx";
import {Seiyuu} from "../../_models/seiyuu.model";
import {MagazineService} from "../magazine.service";
import {SentryErrorHandler} from "../sentry.service";

 describe('errored services', () => {
  let x;
  let injector: TestBed;
  let service: SeiyuuService;
  let backend: HttpTestingController;
  let photoService: PhotoService;
  let magazineService: MagazineService;

  beforeEach(() => {
    x = undefined;
    TestBed.configureTestingModule({
      providers: [MagazineService, MessagesService, PhotoService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports:[HttpClientTestingModule ]
    });
    injector = getTestBed();
    service = injector.get(SeiyuuService);
    photoService = injector.get(PhotoService);
    magazineService = TestBed.get(MagazineService);
    backend = injector.get(HttpTestingController);
  });

  it('should report if loading the brief list fails with 404', fakeAsync(
     inject([ MessagesService ],
       ( msgSvc:MessagesService ) => {
         let spy = spyOn(msgSvc, 'error');
         let spy2 = spyOn(console, 'error');

         expect(service.pending).toBeTruthy();

         service.totalList$.subscribe(data => x = data);

         mockList(backend, '', {status: 404, statusText: 'Not Found'});

         expect(x).toBeFalsy();
         expect(service.pending).toBeFalsy();
         tick(251);
         expect(spy).toHaveBeenCalledWith('Error getting cached list: 404');
         expect(spy2).toHaveBeenCalledWith('Http failure response for https://api.mongolab.com/api/1/databases/myseiyuulist/collections/seiyuu-test?apiKey=R4jg8qqhpTI68lRYfYjEJoM5aRiJnrLK&f={"name":1,"count":1,"updated":1,"alternate_name":1}&s={"name":1}: 404 Not Found');
         backend.verify({ ignoreCancelled: true});
       })
    )
   );

  it('should report if loading the brief list fails with a network error', fakeAsync(
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
         tick(251);
         expect(spy).toHaveBeenCalledWith('Error getting cached list: 0');
         backend.verify({ ignoreCancelled: true});
       })
    )
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

         tick(10);
         expect(spy).toHaveBeenCalledWith('Error loading seiyuu details: 500');
         discardPeriodicTasks();
         backend.verify({ ignoreCancelled: true});
       })
   ));

  it('should report errors',
    inject([SeiyuuService, RestService, RoutingService, MessagesService],
      (seiyuuSvc: SeiyuuService, rest: RestService,  routingSvc: RoutingService, msgSvc: MessagesService) => {
        magazineService.displayMagazines$.subscribe(data => x = data);
        magazineService.pending = true;

        spyOn(rest, 'googleQueryCall').and
          .returnValue(of(
            {
              errors: [{message:'test4'}]
            } ));
        let spy2=spyOn(msgSvc,'error');

        routingSvc.tab$.next('magazines');
        seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Maeda Konomi'})]);

        expect(spy2).toHaveBeenCalledWith('test4');
        expect(x).toBeFalsy();
        expect(magazineService.pending).toBeFalsy();
      })
  );
});
