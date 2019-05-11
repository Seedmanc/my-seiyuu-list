import {TestBed, inject, fakeAsync, tick, discardPeriodicTasks} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RestService} from "../rest.service";
import {MessagesService} from "../messages.service";
import {SeiyuuService} from "../seiyuu.service";
import {PhotoService} from "../photo.service";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import { Seiyuu} from "../../_models/seiyuu.model";
import {SeiyuuServiceMock} from "./seiyuu.service.mock";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {Subject} from "rxjs/Rx";

let x;
let djresult = { html: `<span class="thumb img-thumbnail">
<a href="http://img.booru.org/koe/images//8/c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg" id="p8380" target="_blank">
<img alt="post" border="0" src="http://thumbs.booru.org/koe/thumbnails//8/thumbnail_c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg" title=" davidyuk_jenya solo tagme  score:0 rating:Safe">
</a>
</span><span class="thumb more img-thumbnail"><div>more at</div><b><a href="https://koe.booru.org/index.php?page=post&amp;s=list&amp;tags=~davidyuk_jenya" target="_blank">koe.booru.org</a></b></span>`, pageNum: 0, total: 1, next: false, prev: false };

let djresult2 = {"data":"<span class=\"thumb\">\n  <a href=\"index.php?page=post&amp;s=view&amp;id=8380\" id=\"p8380\">\n    <img alt=\"post\" border=\"0\" src=\"http://thumbs.booru.org/koe/thumbnails//8/thumbnail_c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg\" title=\" davidyuk_jenya solo tagme  score:0 rating:Safe\"/>\n  </a>\n  &#13;\n    \n  \n</span>","paging":"<div id=\"paginator\">\n  \n   \n  <b>1</b>\n   \n</div>"};

describe('PhotoService', () => {
  x = undefined;
  let service: PhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessagesService, SeiyuuService, PhotoService,
        {provide: RoutingService, useClass: RoutingServiceMock},  {provide: SeiyuuService, useClass: SeiyuuServiceMock}
      ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(PhotoService);
  });

  it('should load photos for a single seiyuu with 1 photo',
    inject([SeiyuuService, RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService,   routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe( data  => x = data);

      let spy = spyOn(rest, 'apifyCall').and.returnValue(of(djresult2));

      routingSvc.tab$.next('photos');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'})]);

      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 0);

      expect(x.html.replace(/\s{2,}|\n/gm, '')).toBe(djresult.html.replace(/\s{2,}|\n/gm, ''));
       let {html, ...res} = djresult;
       delete x.html;
       expect(JSON.stringify(x)).toBe(JSON.stringify(res));
      expect(service.pending).toBeFalsy();
    })
  );

  it('should load photos for multiple seiyuu',
    inject([SeiyuuService, RestService, RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe( data => x = data);

      let spy = spyOn(rest, 'apifyCall').and.returnValue(of(djresult2));

      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'}), new Seiyuu({name: 'Chihara Minori'})]);
      routingSvc.tab$.next('photos');

      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+chihara_minori', 0);

      expect(x.html).toBeTruthy();
       let {html, ...res} = djresult;
      delete x.html;
      expect(JSON.stringify(x)).toBe(JSON.stringify(res));
    })
  );

  it('should only load photos when on their tab, only call again when seiyuu change',
    inject([SeiyuuService, RestService, RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe( data  => x = data);

      let spy = spyOn(rest, 'apifyCall').and.returnValue(of(djresult2));

      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'}), new Seiyuu({name: 'Chihara Minori'})]);

      expect(spy).not.toHaveBeenCalled();
      routingSvc.tab$.next('photos');
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+chihara_minori', 0);
      routingSvc.tab$.next('magazines');
      routingSvc.tab$.next('photos');
      expect(spy).toHaveBeenCalledTimes(1);

      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Chihara Minori'})]);
      expect(spy).toHaveBeenCalledWith('chihara_minori+solo', 0);

      expect(x.html).toBeTruthy();
      let {html, ...res} = djresult;
      delete x.html;
      expect(JSON.stringify(x)).toBe(JSON.stringify(res));
    })
  );

  it('should not call when no seiyuu',
    inject([SeiyuuService, RestService, RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe( data  => x = data);

      let spy = spyOn(rest, 'apifyCall').and.returnValue(of(djresult2));

      routingSvc.tab$.next('photos');
      expect(spy).not.toHaveBeenCalled();
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'})]);

      expect(spy).toHaveBeenCalled();
      seiyuuSvc.displayList$['next']([]);
      expect(spy).toHaveBeenCalledTimes(1);

      expect(x).toBeFalsy();
    })
  );

  it('should switch pages and cache previous calls',
    inject([SeiyuuService, RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe(page => {
        if (page) {
          delete page.html;
          x = page;
        }
      });
      let djresult20 = {...djresult2};
      djresult20.data = (new Array(20)).fill(djresult20.data).join('');
      let spy = spyOn(rest, 'apifyCall').and.returnValue(of(djresult20));

      routingSvc.tab$.next('photos');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'})]);
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 0);

      service.nextPage();
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 20);
      expect(JSON.stringify(x)).toBe(JSON.stringify({"pageNum":1,"total":20,"next":true,"prev":true}));
      expect(spy).toHaveBeenCalledTimes(3);

      service.prevPage();
      expect(spy).toHaveBeenCalledTimes(3);
      expect(JSON.stringify(x)).toBe(JSON.stringify({"pageNum":0,"total":20,"next":true,"prev":false}));
    })
  );

  it('should preload next page after current one if it exists',fakeAsync(
    inject([SeiyuuService, RestService , RoutingService, MessagesService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService, msgSvc: MessagesService) => {
      service.displayPhotos$.subscribe(page => {
          x = page;
      });
      let spy = spyOn(rest, 'apifyCall').and.returnValue(of({
        data: (new Array(20)).fill('<span class="thumb"><a><img/></a></span>').join(''),
        paging: ''
      }).delay(500));
      let spy2= spyOn(msgSvc, 'status');

      routingSvc.tab$.next('photos');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'test seiyuu'})]);
      tick(500);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(service.pendingNext).toBeTruthy();
      tick(500) ;
      expect(service.pendingNext).toBeFalsy();
      expect(spy2).toHaveBeenCalledWith('please wait...');

      discardPeriodicTasks();
    }))
  );

  it('should not preload next page there\'s none',fakeAsync(
    inject([SeiyuuService, RestService , RoutingService, MessagesService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService, msgSvc: MessagesService) => {
      service.displayPhotos$.subscribe(page => {
          x = page;
      });
      let spy = spyOn(rest, 'apifyCall').and.returnValue(of({
        data: '<span class="thumb"><a><img/></a></span>',
        paging: ''
      }).delay(500));

      routingSvc.tab$.next('photos');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'test seiyuu'})]);
      tick(500);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(service.pendingNext).toBeFalsy();
    }))
  );

  it('should count images properly',
    inject([SeiyuuService, RestService , RoutingService, MessagesService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService, msgSvc: MessagesService) => {
      let djresult10 = {...djresult2};
      djresult10.data = (new Array(10)).fill(djresult10.data).join('');
      let spy = spyOn(rest, 'apifyCall').and.returnValue(of(djresult10));

       service.displayPhotos$.subscribe(page => {
         if (page) {
           delete page.html;
           x = page;
         }
       });
      routingSvc.tab$.next('photos');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'})]);
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 0);

      expect(JSON.stringify(x)).toBe(JSON.stringify({"pageNum":0,"total":10,"next":false,"prev":false}));
    })
  );

  it('should process errors',
    fakeAsync(inject([SeiyuuService,RestService, RoutingService, MessagesService],
       (seiyuuSvc: SeiyuuService, rest: RestService, routingSvc: RoutingService, msgSvc: MessagesService) => {
       service.displayPhotos$.subscribe(page => {
         if (page) {
           x = page;
         }
       });

      let spy = spyOn(rest, 'apifyCall').and.returnValue(_throw({message:'errmsg'}));

       routingSvc.tab$.next('photos');
       seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'})]);

       let spy2 = spyOn(msgSvc, 'error');
       expect(JSON.stringify(x)).toBe(JSON.stringify({"html":"<span class=\"thumb more img-thumbnail\"><div>more at</div><b><a href=\"https://koe.booru.org/index.php?page=post&amp;s=list&amp;tags=~davidyuk_jenya\" target=\"_blank\">koe.booru.org</a></b></span>","pageNum":0,"total":0,"next":false,"prev":false}));

       tick();
       expect(spy2).toHaveBeenCalledWith('errmsg');})
  ));

   it('getPhotoPage()',
    inject([SeiyuuService, RestService ],
      (seiyuuSvc: SeiyuuService, rest: RestService ) => {
        let spy = spyOn(rest,'apifyCall').and.returnValue(of({
          data:(new Array(3)).fill('<span class="thumb"><a><img/></a></span>').join(''),
          paging:'<div id="paginator"> <a href="?page=post&amp;s=list&amp;tags=koshimizu_ami+solo&amp;pid=0" alt="first page">&lt;&lt;</a><a href="?page=post&amp;s=list&amp;tags=koshimizu_ami+solo&amp;pid=0" alt="back">&lt;</a><a href="?page=post&amp;s=list&amp;tags=koshimizu_ami+solo&amp;pid=0">1</a> <b>2</b> <a href="?page=post&amp;s=list&amp;tags=koshimizu_ami+solo&amp;pid=40">3</a><a href="?page=post&amp;s=list&amp;tags=koshimizu_ami+solo&amp;pid=40" alt="next">&gt;</a><a href="?page=post&amp;s=list&amp;tags=koshimizu_ami+solo&amp;pid=40" alt="last page">&gt;&gt;</a></div>'
        }));

        service['getPhotoPage']('test_seiyuu+solo', 1)
          .subscribe(response => x = response);

        expect(spy).toHaveBeenCalledWith('test_seiyuu+solo', 20);
        expect(x.html).toBe('<span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb more img-thumbnail"><div>more at</div><b><a href="https://koe.booru.org/index.php?page=post&amp;s=list&amp;tags=~test_seiyuu" target="_blank">koe.booru.org</a></b></span>');
        expect(x.pageNum).toBe(1);
        expect(x.total).toBe(50);
        expect(x.next).toBeFalsy();
        expect(x.prev).toBeTruthy();
      })
  );

  xit('wrapper()', // side effects
    inject([SeiyuuService, RestService ],
      ( ) => {
    let r = {
        html:'<span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb img-thumbnail"><a href="" target="_blank"><img></a></span><span class="thumb more img-thumbnail"><div>more at</div><b><a href="https://koe.booru.org/index.php?page=post&amp;s=list&amp;tags=~test_seiyuu" target="_blank">koe.booru.org</a></b></span>',
        pageNum: 1,
        total: 50,
        next: false,
        prev: true
      };
        let spy = spyOn<any>(service,'getPhotoPage').and.returnValue(of(r));

        service['cache'] = {};
        this.page = 1;

        let $ = new Subject();

        $.flatMap(s => service['wrapper'](s[0], s[1]))
          .subscribe(response => x = response);

        $.next([]);
        expect(x).toBeFalsy();
        expect(spy).not.toHaveBeenCalled();

        $.flatMap(s => service['wrapper'](s[0], s[1]))
          .subscribe(response => x = response);
        $.next([['test seiyuu'],2]);
        expect(spy).toHaveBeenCalledWith('test_seiyuu+solo',2);
        expect(x).toBe(r);
        x=undefined;
        spy.calls.reset();
        $.flatMap(s => service['wrapper'](s[0], s[1]))
          .subscribe(response => x = response);
        $.next([['test seiyuu'],2]);
        expect(spy).not.toHaveBeenCalled();
        expect(x).toBe(r);
      })
  );


});
