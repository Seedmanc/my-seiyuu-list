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

xdescribe('errored services', () => {
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

  it('should report if loading the brief list fails with 404',
     inject([ MessagesService],
       ( msgSvc:MessagesService) => {
         let spy = spyOn(msgSvc, 'error');

         expect(service.pending).toBeTruthy();

         service.totalList$.subscribe(data => x = data);

         mockList(backend, '', {status: 404, statusText: 'Not Found'});

         expect(x).toBeFalsy();
         expect(service.pending).toBeFalsy();
         expect(spy).toHaveBeenCalledWith('Error getting cached list: 404');
         backend.verify({ ignoreCancelled: true});
       })
   );

  it('should report if loading the brief list fails with a network error',
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
         backend.verify({ ignoreCancelled: true});
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
         backend.verify({ ignoreCancelled: true});
       })
   ));

  it('wrapper()', // side effects
    inject([SeiyuuService, RestService ],
      ( ) => {
        let r = {
          html:'<span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb more img-thumbnail"><div>more at</div><b><a href="https://koe.booru.org/index.php?page=post&amp;s=list&amp;tags=~test_seiyuu" target="_blank">koe.booru.org</a></b></span>',
          pageNum: 1,
          total: 50,
          next: false,
          prev: true
        };
        let spy = spyOn<any>(photoService,'getPhotoPage').and.returnValue(of(r));

        photoService['cache'] = {};
        this.page = 1;

        let $ = new Subject();

        $.flatMap(s => photoService['wrapper'](s[0], s[1]))
          .subscribe(response => x = response);

        $.next([]);
        expect(x).toBeFalsy();
        expect(spy).not.toHaveBeenCalled();

        $.flatMap(s => photoService['wrapper'](s[0], s[1]))
          .subscribe(response => x = response);
        $.next([['test seiyuu'],2]);
        expect(spy).toHaveBeenCalledWith('test_seiyuu+solo',2);
        expect(x).toBe(r);
        x=undefined;
        spy.calls.reset();
        $.flatMap(s => photoService['wrapper'](s[0], s[1]))
          .subscribe(response => x = response);
        $.next([['test seiyuu'],2]);
        expect(spy).not.toHaveBeenCalled();
        expect(x).toBe(r);
      })
  );

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
