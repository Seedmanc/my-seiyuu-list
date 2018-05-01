import {TestBed, inject, fakeAsync, tick} from '@angular/core/testing';
import { HttpClientModule} from "@angular/common/http";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {RestService} from "../rest.service";
import {MessagesService} from "../messages.service";
import {SeiyuuService} from "../seiyuu.service";
import {PhotoService} from "../photo.service";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import { Seiyuu} from "../../_models/seiyuu.model";
import {Observable} from "rxjs/Observable";

let x;
let djresult = { html: `<span class="thumb img-thumbnail">
<a href="http://img.booru.org/koe/images//8/c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg" id="p8380" target="_blank">
<img alt="post" border="0" src="http://thumbs.booru.org/koe/thumbnails//8/thumbnail_c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg" title=" davidyuk_jenya solo tagme  score:0 rating:Safe">
</a>
</span><span class="thumb img-thumbnail"><div class="more">more at</div><b><a href="http://koe.booru.org/index.php?page=post&amp;s=list&amp;tags=~davidyuk_jenya" target="_blank">koe.booru.org</a></b></span>`, pageNum: 0, total: 1, next: false, prev: false };

let djresult2 = {"data":"<span class=\"thumb\">\n  <a href=\"index.php?page=post&amp;s=view&amp;id=8380\" id=\"p8380\">\n    <img alt=\"post\" border=\"0\" src=\"http://thumbs.booru.org/koe/thumbnails//8/thumbnail_c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg\" title=\" davidyuk_jenya solo tagme  score:0 rating:Safe\"/>\n  </a>\n  &#13;\n    \n  <script type=\"text/javascript\">\n    <![CDATA[\n    //]]>\n    <![CDATA[<![CDATA[\n    posts[8380] = {'tags':'davidyuk_jenya solo tagme'.split(/ /g), 'rating':'Safe', 'score':0, 'user':'Seedmanc'}\n    //]]]]><![CDATA[>\n    ]]>\n  </script>\n</span>","paging":"<div id=\"paginator\">\n  <script type=\"text/javascript\">\n    <![CDATA[\n   //]]>\n    <![CDATA[<![CDATA[\n   filterPosts(posts)\n   //]]]]><![CDATA[>\n   ]]>\n  </script>\n   \n  <b>1</b>\n   \n</div>"};

describe('PhotoService', () => {
  x = undefined;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ RestService, MessagesService, SeiyuuService, PhotoService, {provide: RoutingService, useClass: RoutingServiceMock}
      ],
      imports: [
        HttpClientModule, HttpClientTestingModule
      ],
    });
  });

  it('should load photos for a single seiyuu with 1 photo',
    inject([SeiyuuService, PhotoService,  RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, service:PhotoService, rest: RestService,   routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe(data => x = data);

      let spy = spyOn(rest, 'yahooQueryCall').and.returnValue(Observable.of(djresult2));

      routingSvc.tab$.next('photos');
      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Davidyuk Jenya'})]);

      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 0);

      expect(x.html.replace(/\s{2,}|\n/gm, '')).toBe(djresult.html.replace(/\s{2,}|\n/gm, ''));
       let {html, ...res} = djresult;
       delete x.html;
       expect(JSON.stringify(x)).toBe(JSON.stringify(res));
      expect(service.pending).toBeFalsy();
    })
  );

  it('should load photos for multiple seiyuu',
    inject([SeiyuuService, PhotoService,  RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, service:PhotoService, rest: RestService,   routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe(data => x = data);

      let spy = spyOn(rest, 'yahooQueryCall').and.returnValue(Observable.of(djresult2));

      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Davidyuk Jenya'}), new Seiyuu({name: 'Chihara Minori'})]);
      routingSvc.tab$.next('photos');

      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+chihara_minori', 0);

      expect(x.html).toBeTruthy();
       let {html, ...res} = djresult;
      delete x.html;
      expect(JSON.stringify(x)).toBe(JSON.stringify(res));
    })
  );

  it('should only load photos when on their tab, only call again when seiyuu change',
    inject([SeiyuuService, PhotoService,  RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, service:PhotoService, rest: RestService,   routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe(data => x = data);

      let spy = spyOn(rest, 'yahooQueryCall').and.returnValue(Observable.of(djresult2));

      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Davidyuk Jenya'}), new Seiyuu({name: 'Chihara Minori'})]);

      expect(spy).not.toHaveBeenCalled();
      routingSvc.tab$.next('photos');
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+chihara_minori', 0);
      routingSvc.tab$.next('magazines');
      routingSvc.tab$.next('photos');
      expect(spy).toHaveBeenCalledTimes(1);

      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Chihara Minori'})]);
      expect(spy).toHaveBeenCalledWith('chihara_minori+solo', 0);

      expect(x.html).toBeTruthy();
      let {html, ...res} = djresult;
      delete x.html;
      expect(JSON.stringify(x)).toBe(JSON.stringify(res));
    })
  );

  it('should not call when no seiyuu',
    inject([SeiyuuService, PhotoService,  RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, service:PhotoService, rest: RestService,   routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe(data => x = data);

      let spy = spyOn(rest, 'yahooQueryCall').and.returnValue(Observable.of(djresult2));

      routingSvc.tab$.next('photos');
      expect(spy).not.toHaveBeenCalled();
      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Davidyuk Jenya'})]);

      expect(spy).toHaveBeenCalled();
      seiyuuSvc.loadedSeiyuu$.next([]);
      expect(spy).toHaveBeenCalledTimes(1);

      expect(x.html).toBeFalsy();
      expect(JSON.stringify(x)).toBe(JSON.stringify({html:'', next: false, prev: false, pageNum: 0, total: 0}));
    })
  );

  it('should switch pages and cache previous calls',
    inject([SeiyuuService, PhotoService,  RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, service:PhotoService, rest: RestService,   routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe(({html, ...data}) => x = data);
      let djresult20 = {...djresult2};
      djresult20.data = (new Array(20)).fill(djresult20.data).join('');
      let spy = spyOn(rest, 'yahooQueryCall').and.returnValue(Observable.of(djresult20));

      routingSvc.tab$.next('photos');
      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Davidyuk Jenya'})]);
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 0);

      service.pageDelta.next(1);
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 20);
      expect(JSON.stringify(x)).toBe(JSON.stringify({"pageNum":1,"total":20,"next":true,"prev":true}));
      expect(spy).toHaveBeenCalledTimes(2);

      service.pageDelta.next(-1);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(JSON.stringify(x)).toBe(JSON.stringify({"pageNum":0,"total":20,"next":true,"prev":false}));
    })
  );

  it('should count images properly',
    inject([SeiyuuService, PhotoService,  RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, service:PhotoService, rest: RestService,   routingSvc: RoutingService) => {
      service.displayPhotos$.subscribe(({html, ...data}) => x = data);
      let djresult10 = {...djresult2};
      djresult10.data = (new Array(10)).fill(djresult10.data).join('');
      let spy = spyOn(rest, 'yahooQueryCall').and.returnValue(Observable.of(djresult10));

      routingSvc.tab$.next('photos');
      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Davidyuk Jenya'})]);
      expect(spy).toHaveBeenCalledWith('davidyuk_jenya+solo', 0);

      expect(JSON.stringify(x)).toBe(JSON.stringify({"pageNum":0,"total":10,"next":false,"prev":false}));
    })
  );

  it('should process errors',
    fakeAsync(inject([SeiyuuService, PhotoService,  RestService , RoutingService, MessagesService],
       (seiyuuSvc: SeiyuuService, service:PhotoService, rest: RestService, routingSvc: RoutingService, msgSvc: MessagesService) => {
      service.displayPhotos$.subscribe(data => x = data);

      let spy = spyOn(rest, 'yahooQueryCall').and.returnValue(Observable.throw({message:'errmsg'}));

       routingSvc.tab$.next('photos');
       seiyuuSvc.loadedSeiyuu$.next([new Seiyuu({name: 'Davidyuk Jenya'})]);

       let spy2 = spyOn(msgSvc, 'error');
       expect(JSON.stringify(x)).toBe(JSON.stringify({"html":"<span class=\"thumb img-thumbnail\"><div class=\"more\">more at</div><b><a href=\"http://koe.booru.org/index.php?page=post&amp;s=list&amp;tags=~davidyuk_jenya\" target=\"_blank\">koe.booru.org</a></b></span>","pageNum":0,"total":'no',"next":false,"prev":false}));

       tick();
       expect(spy2).toHaveBeenCalledWith('errmsg');})
  ));


});
