import {TestBed, inject, fakeAsync, tick, discardPeriodicTasks} from '@angular/core/testing';

import { SeiyuuService } from '../seiyuu.service';
import {RestService} from "../rest.service";
import {HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../messages.service";
import {RouterTestingModule} from "@angular/router/testing";
import {AnimeService} from "../anime.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {env} from "../../../environments/environment";
import {basicModel, basicModel2, model, model2} from "../../_models/tests/seiyuu.model.spec";
import {Namesake, BasicSeiyuu, Seiyuu} from "../../_models/seiyuu.model";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

describe('SeiyuuService', () => {
  let basicList = [
    basicModel,
    basicModel2
  ];
  let list = [
    model,
    model2
  ];
  let x; let mockList = (backend, returned) => backend.expectOne({
    url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"name":1,"hits":1,"updated":1,"count":1,"accessed":1}&s={"name":1}`,
    method:'GET'
  }, 'GET to count the # of records in the seiyuu DB').flush(...returned);

  beforeEach(() => {
    x = undefined;
    TestBed.configureTestingModule({
      providers: [SeiyuuService, RestService, MessagesService, {provide: RoutingService, useClass: RoutingServiceMock} , AnimeService ],
      imports:[HttpClientModule, RouterTestingModule, HttpClientTestingModule ]
    });
  });

  it('should be created', inject([SeiyuuService], (service: SeiyuuService) => {
    expect(service).toBeTruthy();
  }));

  it('should on init fetch the record count from seiyuu and anime, toggling pending state and setting status',
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
      let spy = spyOn(msgSvc, 'status');

      expect(service.pending).toBeTruthy();
      service.totalList$.subscribe(data => x=data);

      mockList(backend, [basicList]);

      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&c=true`,
        method:'GET'
      }, 'GET to count the # of records in the anime DB').flush(7);
      expect(x).toBeTruthy();
      expect(service.pending).toBeFalsy();
      expect(spy).toHaveBeenCalledWith(basicList.length + ` seiyuu & 7 anime records cached`);
    })
   );

  it('should report if loading the total list fails with 404',
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
      let spy = spyOn(msgSvc, 'error');

      expect(service.pending).toBeTruthy();

      expect(()=> {
        service.totalList$.subscribe(data => x = data);

        mockList(backend, ['', {status: 404, statusText: 'Not Found'}]);
      }).toThrow();
      expect(x).toBeFalsy();
      expect(service.pending).toBeFalsy();
      expect(spy).toHaveBeenCalledWith('Error getting cached list: 404');
    })
   );

  it('should report if loading the total list fails with a network error',
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
      let spy = spyOn(msgSvc, 'error');
      let x;

      expect(service.pending).toBeTruthy();

      expect(()=>{
        service.totalList$
          .subscribe(r => x=r);

        let request = backend.expectOne(
          `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"name":1,"hits":1,"updated":1,"count":1,"accessed":1}&s={"name":1}`
        );
        request.error(new ErrorEvent(''));
      }).toThrow();

      expect(x).toBeFalsy();
      expect(service.pending).toBeFalsy();
      expect(spy).toHaveBeenCalledWith('Error getting cached list: 0');
    })
   );

  it('should report if loading details fails with 500', fakeAsync(
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
        let spy = spyOn(msgSvc, 'error');

        mockList(backend, [basicList]);

        service.updateRequest$.next(53);
        tick(200);

        backend.expectOne({
          url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&q={"_id":{"$in":[53]}}`,
          method:'GET'
        }, 'GET to load seiyuu details').flush('', {status: 500, statusText: 'Bad Request'});

        expect(spy).toHaveBeenCalledWith('Error loading seiyuu details: 500');
        discardPeriodicTasks();
      })
  ));

  it('should load seiyuu details upon an update request', fakeAsync(
    inject([SeiyuuService, HttpTestingController, RestService],
      (service:SeiyuuService, backend:HttpTestingController, restSvc:RestService) => {
      service.totalList$.subscribe(data => x=data);
      let spy = spyOn(restSvc, 'mongoCall').and.returnValue(Observable.of(list));

      mockList(backend, [basicList]);

      service.updateRequest$.next(53);
      service.updateRequest$.next(0);
      tick(200);

      expect(spy).toHaveBeenCalledWith({
        coll: 'seiyuu-test',
        mode: 'GET',
        query: {
          q: {
            _id: {'$in': [53,0]}
          }
        }
      });

      expect(JSON.stringify(x)).toBe(JSON.stringify([new Seiyuu(model), new BasicSeiyuu(model2)]));

      discardPeriodicTasks();
    })
  ));

  it('should error on searching for unknown name',
    inject([SeiyuuService, MessagesService, HttpTestingController],
      (service:SeiyuuService, msgSvc:MessagesService, backend:HttpTestingController) => {
      let spy = spyOn(msgSvc, 'error');

      mockList(backend, [basicList]);

      service.addSearch(Observable.of('derp'));
      expect(spy).toHaveBeenCalledWith(`"derp" is not found`);
    })
  );

  it('should find by name',
    inject([SeiyuuService,  HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);

      mockList(backend, [basicList]);

      service.addSearch(Observable.of('Maeda Konomi'));
      expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu(basicModel)]));
    })
  );

  it('should remove seiyuu from display by id',
    inject([SeiyuuService, RoutingService, HttpTestingController],
      (service:SeiyuuService, routingSvc:RoutingService,  backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);
      let spy = spyOn(routingSvc, 'remove').and.callThrough();

      mockList(backend, [basicList]);

      service.addSearch(Observable.of('Maeda Konomi'));
      service.removed$.next(578);

      expect(spy).toHaveBeenCalledWith(578,[578]);
      expect(JSON.stringify(x)).toBe(JSON.stringify([]));
    })
  );

  it('should remove namesakes by name',
    inject([SeiyuuService,  HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);

      mockList(backend, [[basicModel,basicModel]]);

      service.addSearch(Observable.of('Maeda Konomi'));
      service.removed$.next('Maeda Konomi');

      expect(JSON.stringify(x)).toBe(JSON.stringify([]));
    })
  );

  it('should avoid duplicates',
    inject([SeiyuuService, MessagesService, HttpTestingController],
      (service:SeiyuuService, msgSvc:MessagesService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);
      let spy = spyOn(msgSvc, 'status');
      let search = new BehaviorSubject('Maeda Konomi');

      mockList(backend, [basicList]);

      service.addSearch(search);
      search.next('test');
      search.next('Maeda Konomi');
      expect(spy).toHaveBeenCalledWith('"Maeda Konomi" is already selected');
    })
  );

  it('should find namesakes',
    inject([SeiyuuService, HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);

      mockList(backend, [[basicModel,basicModel]]);

      service.addSearch(Observable.of('Maeda Konomi'));
      expect(JSON.stringify(x)).toBe(JSON.stringify([new Namesake([new BasicSeiyuu(basicModel), new BasicSeiyuu(basicModel)])]
      ));
    })
  );

  it('should pick one seiyuu from a list of namesakes',
    inject([SeiyuuService, HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
        service.displayList$.subscribe(data => x=data);

        let bm2= Object.assign({}, basicModel);
        bm2._id = bm2._id*1000;

        mockList(backend, [[basicModel,bm2]]);

        service.addSearch(Observable.of('Maeda Konomi'));

        expect(JSON.stringify(x)).toBe(JSON.stringify([new Namesake([new BasicSeiyuu(basicModel), new BasicSeiyuu(bm2)])]));
        service.picked$.next(bm2._id);

        expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu(bm2)]));
      })
  );
});
