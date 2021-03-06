import {TestBed, inject, fakeAsync, tick, discardPeriodicTasks, getTestBed} from '@angular/core/testing';

import { SeiyuuService } from '../seiyuu.service';
import {RestService} from "../rest.service";
import {MessagesService} from "../messages.service";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {env} from "../../../environments/environment";
import {basicModel, basicModel2, model, model2} from "../../_models/tests/seiyuu.model.spec";
import {BasicSeiyuu, Seiyuu} from "../../_models/seiyuu.model";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import {of} from "rxjs/observable/of";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export const mockList = (backend, returned, opts?) => {
  let r = backend.expectOne({
    url:
      `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"name":1,"count":1,"updated":1,"alternate_name":1}&s={"name":1}`,
    method:'GET'
  }, 'GET to count the # of records in the seiyuu DB');
  if (opts) r.error(new ErrorEvent(''), opts)
  else r.flush(returned);
};

export const basicList = [
  basicModel,
  basicModel2
];

 describe('SeiyuuService', () => {
  let x;
  let Stringify = require('json-stable-stringify');

  let service: SeiyuuService;
  let backend: HttpTestingController;

  beforeEach(() => {
    x = undefined;
    TestBed.configureTestingModule({
      providers: [ MessagesService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports:[RouterTestingModule, HttpClientTestingModule ]
    });
    service = TestBed.get(SeiyuuService);
    backend = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    backend.verify({ ignoreCancelled: true});
  });

   it('should on init fetch the brief list from seiyuu, toggling pending state',
      (  ) => {
        expect(service.pending).toBeTruthy();
        service.totalList$.subscribe(data => x=data);

        mockList(backend, basicList);

        expect(x).toBeTruthy();
        expect(service.pending).toBeFalsy();
      }
  );

  it('should on ranking fetch the additional details list from seiyuu (if not yet), toggling local pending state',
      (  ) => {
        let pending = {is: true};

        service.getRanking(pending).subscribe(data => x=data);

        mockList(backend, basicList);

        backend.expectOne({
          url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"hits":1,"accessed":1}`,
          method:'GET'
        }, 'GET to load additional seiyuu details').flush([basicList]);

        expect(x).toBeTruthy();
        expect(pending.is).toBeFalsy();

        pending = {is: true};

        service.getRanking(pending).subscribe( );

        backend.expectNone({
          url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"hits":1,"accessed":1}`,
          method:'GET'
        }, 'GET to load additional seiyuu details');
      }
  );

  it('should load seiyuu details upon an update request and emit to loaded list', fakeAsync(
    inject([  RestService, RoutingService],
      (  restSvc:RestService, routingSvc:RoutingService) => {
        let loaded;
        service.totalList$.subscribe(data => x=data );
        service.loadedSeiyuu$.subscribe(data => loaded=data );
        let spy = spyOn(restSvc, 'mongoCall').and.returnValue(of([model,model2]));

        routingSvc.routeId$.next([578]);
        routingSvc.add(0);

        mockList(backend, basicList);

        expect(x[0].pending).toBeTruthy();
        service.requestUpdate(578);
        service.requestUpdate(0);
        tick(200);

        expect(spy).toHaveBeenCalledWith({
          coll: 'seiyuu-test',
          mode: 'GET',
          query: {
            q: {
              _id: {'$in': [578,0]}
            }
          }
        });

        expect(Stringify(x)).toBe(Stringify([new Seiyuu(model), new BasicSeiyuu(model2)]));
        expect(Stringify(loaded)).toBe(Stringify([new Seiyuu(model), new BasicSeiyuu(model2)]));
        expect(loaded[0].pending).toBeFalsy();

        discardPeriodicTasks();
      })
  ));

  it('should emit to loaded list from cache immediately', fakeAsync(
    inject([  RestService, RoutingService],
      (  restSvc:RestService, routingSvc:RoutingService) => {
        let loaded, display:any = [1];
        service.totalList$.subscribe(data => x=data );
        service.loadedSeiyuu$.subscribe(data => loaded=data );
        service.displayList$.subscribe(data => display=data );
        let spy = spyOn(restSvc, 'mongoCall').and.returnValue(of([model]));

        routingSvc.routeId$.next([578]);
        routingSvc.add(0);

        mockList(backend, [basicModel]);
        expect(x[0].pending).toBeTruthy();
        service.requestUpdate(578);
        tick(200);

        expect(Stringify(x)).toBe(Stringify([new Seiyuu(model) ]));
        expect(loaded[0].pending).toBeFalsy();

        service.removeById(578);
        expect(loaded.length).toBeFalsy();

        routingSvc.routeId$.next([578]);
        routingSvc.add(0);
        expect(display.length).toBeTruthy();
        expect(loaded[0].pending).toBeFalsy();

       discardPeriodicTasks();
      })
  ));

  it('should error on searching for unknown name',
    inject([ MessagesService ],
      ( msgSvc:MessagesService ) => {
        let spy = spyOn(msgSvc, 'error');

        mockList(backend, basicList);

        service.search$.next('derp');
        expect(spy).toHaveBeenCalledWith(`"derp" is not found`);
      })
  );

  it('should find by name',
      ( ) => {
        service.displayList$.subscribe(data => x=data);

        mockList(backend, basicList);

        service.search$.next('Maeda Konomi');
        expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu(basicModel)]));
      }
  );

  it('should remove seiyuu from display by id',
    inject([ RoutingService ],
      (  routingSvc:RoutingService ) => {
        service.displayList$.subscribe(data => x=data);
        let spy = spyOn(routingSvc, 'remove').and.callThrough();

        mockList(backend, basicList);

        service.search$.next('Maeda Konomi');
        service.removeById(578);

        expect(spy).toHaveBeenCalledWith(578);
        expect(JSON.stringify(x)).toBe(JSON.stringify([]));
      })
  );

  it('should remove namesakes by name',
      ( ) => {
        service.displayList$.subscribe(data => x=data);

        mockList(backend, [basicModel,basicModel]);

        service.search$.next('Maeda Konomi');
        service.removeByName('Maeda Konomi');

        expect(JSON.stringify(x)).toBe(JSON.stringify([]));
      }
  );

  it('should avoid duplicates',
      ( ) => {
        service.displayList$.subscribe(data => x=data);
        let search = new BehaviorSubject('Maeda Konomi');

        mockList(backend, basicList);

        service.search$.next('Test Name');
        service.search$.next('Maeda Konomi');
        expect(x.length).toBe(2);
      }
  );

  it('should find namesakes',
    inject([ RoutingService],
      ( routingSvc:RoutingService) => {
        routingSvc.routeId$.next([]);
        service.displayList$ .subscribe(data => x=data);

        mockList(backend, [basicModel,basicModel]);

        service.search$.next('Maeda Konomi');
        expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu({namesakes: [new BasicSeiyuu(basicModel), new BasicSeiyuu(basicModel)]})]
        ));
      })
  );

  it('should pick one seiyuu from a list of namesakes',
    inject([ RoutingService],
      (  routingSvc:RoutingService) => {
        routingSvc.routeId$.next([]);
        service.displayList$.subscribe(data => x=data);

        let bm2= Object.assign({}, basicModel);
        bm2._id = bm2._id*1000;

        mockList(backend, [basicModel,bm2]);

        service.search$.next('Maeda Konomi');

        expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu({namesakes: [new BasicSeiyuu(basicModel), new BasicSeiyuu(bm2)]})]));
        service.pickNamesake(bm2._id);

        expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu(bm2)]));
      })
  );

  it('should limit selections to 4',
      ( ) => {
        service.displayList$.subscribe(data => x=data);
        let list = basicList.slice();

        for (let i=0;i<3;i++) {
          let el = Object.assign({},list[0]);
          el._id = el._id*(i+2);
          el.name = el.name+i;
          list.push(el)
        }

        mockList(backend, list);

        service.search$.next('Test Name');
        service.search$.next('Maeda Konomi');
        service.search$.next('Maeda Konomi0');
        service.search$.next('Maeda Konomi1');
        service.search$.next('Maeda Konomi2');
        expect(x.length).toBe(4);
      }
  );

   it('should report the available & selected seiyuu',
      ( ) => {
        mockList(backend, basicList);
        expect(service.isAvailable('Maeda Konomi')).toBeTruthy();
        service.addSeiyuu('Maeda Konomi');
        service.addSeiyuu('Test Name');
        expect(JSON.stringify(service.selectedSeiyuu)).toBe(JSON.stringify(['Maeda Konomi','Test Name']));
      }
  );

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
         expect(spy2).toHaveBeenCalledWith('Http failure response for '+env.mongoUrl+'/collections/seiyuu-test?apiKey='+env.apiKey+'&f={"name":1,"count":1,"updated":1,"alternate_name":1}&s={"name":1}: 404 Not Found');
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
         let spy2 = spyOn(console, 'error');

         mockList(backend, basicList);
         service.addSeiyuu('Chihara Minori');
         service.requestUpdate(53);
         tick(200);

         backend.expectOne({
           url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&q={"_id":{"$in":[53]}}`,
           method:'GET'
         }, 'GET to load seiyuu details').flush('', {status: 500, statusText: 'Bad Request'});

         tick(10);
         expect(spy).toHaveBeenCalledWith('Error loading seiyuu details: 500');
         expect(spy2).toHaveBeenCalledWith('Http failure response for '+env.mongoUrl+'/collections/seiyuu-test?apiKey='+env.apiKey+'&q={"_id":{"$in":[53]}}: 500 Bad Request');
         expect(service.selectedSeiyuu.length).toBe(0);
         discardPeriodicTasks();
         backend.verify({ ignoreCancelled: true});
       })
   ));
});
