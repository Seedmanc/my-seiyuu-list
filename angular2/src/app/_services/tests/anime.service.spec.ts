import {TestBed, inject} from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {AnimeService} from "../anime.service";
import {RestService} from "../rest.service";
import {env} from "../../../environments/environment";
import {MessagesService} from "../messages.service";
import {SeiyuuService} from "../seiyuu.service";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import {basicModel, model, model2} from "../../_models/tests/seiyuu.model.spec";
import {Seiyuu} from "../../_models/seiyuu.model";
import {Anime, HashOfRoles} from "../../_models/anime.model";
import {mockList} from "./seiyuu.service.spec";
import {of} from "rxjs/observable/of";
import {BusService} from "../bus.service";

let x;
let roles =  [{
    "name": "Character 1",
    "main": false,
    "_id": 1
  },{
    "name": "Character 2",
    "main": true,
    "_id": 1
  },{
    "name": "Character 1",
    "main": true,
    "_id": 2
  },{
    "name": "Character 3",
    "main": false,
    "_id": 3
  }];
let hashOfRoles:HashOfRoles[] = [
  {
    1: [{
      name: 'character1',
      main: true,
      _id: 11
    }],
    2: [{
        name: 'character2',
        main: true,
        _id: 11
       }, {
        name: 'character3',
        main: false,
        _id: 11
    }],
    3: [{
      name: 'character4',
      main: false,
      _id: 11
    }],
  },
  {
    1: [{
      name: 'character5',
      main: false,
      _id: 22
    }],
    2: [{
        name: 'character2',
        main: true,
        _id: 22
       }, {
        name: 'character6',
        main: false,
        _id: 22
    }],
    4: [{
      name: 'character7',
      main: false,
      _id: 22
    }],
  }
];
describe('AnimeService', () => {
  x = undefined;
  let service: AnimeService;
  let backend: HttpTestingController;

  beforeEach(() => {
    Anime.detailsCache = {};
    TestBed.configureTestingModule({
      providers: [AnimeService, RestService, MessagesService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(AnimeService);
    backend = TestBed.get(HttpTestingController);
  });

  it('should fetch the record count from anime db',
() => {
      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&c=true`,
        method:'GET'
      }, 'GET to count the # of records in the anime DB').flush(4286);
    }
  );

  it('should display anime for a single seiyuu',
    inject([SeiyuuService],
      (seiyuuSvc:SeiyuuService) => {
      let y;

      service.displayAnime$.subscribe(data => x = data);
      seiyuuSvc.selected$.subscribe(data => y = data);

      let loaded = Object.assign({}, model);
      loaded.roles.push(...roles);

      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu(loaded)]);
      mockList(backend, [basicModel,basicModel]);

      expect(y).toBe(model._id);
      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&f={"title":1,"pic":1}&q={"_id":{"$in":[1,2,3,2829]}}`,
        method:'GET'
      }, 'GET to load details from anime DB').flush([
          {_id:2829, title: 'Ie Naki Ko Remi', pic:'/images/anime/12/26250v.jpg'},
          {_id:1, title: 'title 1', pic:'/pic1.jpg'},
          {_id:2, title: 'title 2', pic:'/pic2.jpg'},
          {_id:3, title: 'title 3', pic:'/pic3.jpg'},
        ]
      );

      expect(JSON.stringify(x[3])).toBe(
'{"_id":2829,"rolesBySeiyuu":{"578":[{"name":"Pierre","main":false,"_id":578}]},"main":false,"link":"//myanimelist.net/anime/2829","thumb":"//myanimelist.net/images/anime/12/26250v.jpg","firstCharacter":"Pierre","characters":[{"name":"Pierre","main":false}],"title":"Ie Naki Ko Remi"}');
      expect(JSON.stringify(x[0])).toBe(
'{"_id":1,"rolesBySeiyuu":{"578":[{"name":"Character 2","main":true,"_id":578},{"name":"Character 1","main":false,"_id":578}]},"main":true,"link":"//myanimelist.net/anime/1","thumb":"//myanimelist.net/pic1v.jpg","firstCharacter":"Character 2","characters":[{"name":"Character 2","main":true},{"name":"Character 1","main":false}],"title":"title 1"}' );
      expect(JSON.stringify(x[1])).toBe(
'{"_id":2,"rolesBySeiyuu":{"578":[{"name":"Character 1","main":true,"_id":578}]},"main":true,"link":"//myanimelist.net/anime/2","thumb":"//myanimelist.net/pic2v.jpg","firstCharacter":"Character 1","characters":[{"name":"Character 1","main":true}],"title":"title 2"}');
      expect(JSON.stringify(x[2])).toBe(
'{"_id":3,"rolesBySeiyuu":{"578":[{"name":"Character 3","main":false,"_id":578}]},"main":false,"link":"//myanimelist.net/anime/3","thumb":"//myanimelist.net/pic3v.jpg","firstCharacter":"Character 3","characters":[{"name":"Character 3","main":false}],"title":"title 3"}');
    })
  );

  it('should display shared anime for multiple seiyuu, also for mainOnly',
    inject([SeiyuuService],
      (seiyuuSvc:SeiyuuService) => {
      let y;

      service.displayAnime$.subscribe(data => x = data);
      seiyuuSvc.selected$.subscribe(data => y = data);

      let loaded = Object.assign({}, model);
      loaded.roles.push(...roles);

      let loaded2 = Object.assign({}, model2);
      loaded2.roles.push({
        "name": "Character 1",
        "main": true,
        "_id": 2
      },{
        "name": "Character 3",
        "main": false,
        "_id": 3
      },{
        "name": "Character 4",
        "main": false,
        "_id": 4
      });
      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu(loaded),new Seiyuu(loaded2)]);
      mockList(backend, [basicModel,basicModel]);

      expect(y).toBe(model2._id);
      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&f={"title":1,"pic":1}&q={"_id":{"$in":[2,3,2829]}}`,
        method:'GET'
      }, 'GET to load details from anime DB').flush([
          {_id:2829, title: 'Ie Naki Ko Remi', pic:'/images/anime/12/26250v.jpg'},
          {_id:2, title: 'title 2', pic:'/pic2.jpg'},
          {_id:3, title: 'title 3', pic:'/pic3.jpg'},
        ]
      );

      expect(Anime.detailsCache[2].title).toBe('title 2');
      expect(Anime.detailsCache[3].pic).toBe('/pic3.jpg');

      expect(JSON.stringify(x[0])).toBe(
        '{"_id":2,"rolesBySeiyuu":{"0":[{"name":"Character 1","main":true,"_id":0}],"578":[{"name":"Character 1","main":true,"_id":578},{"name":"Character 1","main":true,"_id":578}]},"main":true,"link":"//myanimelist.net/anime/2","thumb":"//myanimelist.net/pic2v.jpg","firstCharacter":"Character 1","characters":[{"name":"Character 1","main":true},{"name":"Character 1","main":true}],"title":"title 2"}'      );
      expect(JSON.stringify(x[1])).toBe(
        '{"_id":3,"rolesBySeiyuu":{"0":[{"name":"Character 3","main":false,"_id":0}],"578":[{"name":"Character 3","main":false,"_id":578},{"name":"Character 3","main":false,"_id":578}]},"main":false,"link":"//myanimelist.net/anime/3","thumb":"//myanimelist.net/pic3v.jpg","firstCharacter":"Character 3","characters":[{"name":"Character 3","main":false},{"name":"Character 3","main":false}],"title":"title 3"}'      );
      expect(JSON.stringify(x[2])).toBe(
        '{"_id":2829,"rolesBySeiyuu":{"0":[{"name":"Pierre","main":false,"_id":0}],"578":[{"name":"Pierre","main":false,"_id":578}]},"main":false,"link":"//myanimelist.net/anime/2829","thumb":"//myanimelist.net/images/anime/12/26250v.jpg","firstCharacter":"Pierre","characters":[{"name":"Pierre","main":false}],"title":"Ie Naki Ko Remi"}'      );

      service.mainOnly$.next(true);
      backend.expectNone({
          url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&f={"title":1,"pic":1}&q={"_id":{"$in":[2]}}`,
          method:'GET'
        }, 'should not request cached anime again');
      expect(JSON.stringify(x[0])).toBe(
        '{"_id":2,"rolesBySeiyuu":{"0":[{"name":"Character 1","main":true,"_id":0}],"578":[{"name":"Character 1","main":true,"_id":578},{"name":"Character 1","main":true,"_id":578}]},"main":true,"link":"//myanimelist.net/anime/2","thumb":"//myanimelist.net/pic2v.jpg","firstCharacter":"Character 1","characters":[{"name":"Character 1","main":true},{"name":"Character 1","main":true}],"title":"title 2"}'
      );
  }));

  it('should display no shared anime for multiple seiyuu if none found',
      inject([SeiyuuService],
        (seiyuuSvc:SeiyuuService) => {
        let y;

        service.displayAnime$.subscribe(data => x = data);
        seiyuuSvc.selected$.subscribe(data => y = data);

        let loaded = Object.assign({}, model);
        loaded.roles.push(...roles);

        let loaded2 = Object.assign({}, model2);
        loaded2.roles = [];
        seiyuuSvc.loadedSeiyuu$.next([new Seiyuu(loaded),new Seiyuu(loaded2)]);
        mockList(backend, [basicModel,basicModel]);

        expect(y).toBe(model2._id);

        expect(JSON.stringify(x)).toBe('[]');

        seiyuuSvc.selected$.next(578);
        expect(Anime.activeSeiyuu).toBe(578);
    })
  );

  it('sharedAnime([...])', () => {
     Anime.activeSeiyuu = 22;
     expect(JSON.stringify(service['sharedAnime'](hashOfRoles))).toBe('[{"_id":1,"rolesBySeiyuu":{"11":[{"name":"character1","main":true,"_id":11}],"22":[{"name":"character5","main":false,"_id":22}]},"main":false,"link":"//myanimelist.net/anime/1","thumb":"","firstCharacter":"character5","characters":[{"name":"character5","main":false}],"title":"1"},{"_id":2,"rolesBySeiyuu":{"11":[{"name":"character2","main":true,"_id":11},{"name":"character3","main":false,"_id":11}],"22":[{"name":"character2","main":true,"_id":22},{"name":"character6","main":false,"_id":22}]},"main":true,"link":"//myanimelist.net/anime/2","thumb":"","firstCharacter":"character2","characters":[{"name":"character2","main":true},{"name":"character6","main":false}],"title":"2"}]');

     Anime.activeSeiyuu = 11;
     expect(JSON.stringify(service['sharedAnime'](hashOfRoles))).toBe('[{"_id":1,"rolesBySeiyuu":{"11":[{"name":"character1","main":true,"_id":11}],"22":[{"name":"character5","main":false,"_id":22}]},"main":true,"link":"//myanimelist.net/anime/1","thumb":"","firstCharacter":"character1","characters":[{"name":"character1","main":true}],"title":"1"},{"_id":2,"rolesBySeiyuu":{"11":[{"name":"character2","main":true,"_id":11},{"name":"character3","main":false,"_id":11}],"22":[{"name":"character2","main":true,"_id":22},{"name":"character6","main":false,"_id":22}]},"main":true,"link":"//myanimelist.net/anime/2","thumb":"","firstCharacter":"character2","characters":[{"name":"character2","main":true},{"name":"character3","main":false}],"title":"2"}]');
    }
  );
  it('sharedAnime([])', () => {
     expect(JSON.stringify(service['sharedAnime']([]))).toBe('null');
    }
  );
  it('sharedAnime([...],"main")', () => {
     Anime.activeSeiyuu = 11;
     expect(JSON.stringify(service['sharedAnime'](hashOfRoles, "main"))).toBe('[{"_id":2,"rolesBySeiyuu":{"11":[{"name":"character2","main":true,"_id":11}],"22":[{"name":"character2","main":true,"_id":22}]},"main":true,"link":"//myanimelist.net/anime/2","thumb":"","firstCharacter":"character2","characters":[{"name":"character2","main":true}],"title":"2"}]');
    }
  );
  it('sharedAnime([...],"!main")', () => {
     Anime.activeSeiyuu = 11;
     expect(JSON.stringify(service['sharedAnime'](hashOfRoles, "!main"))).toBe('[{"_id":1,"rolesBySeiyuu":{"11":[{"name":"character1","main":true,"_id":11}],"22":[{"name":"character5","main":false,"_id":22}]},"main":true,"link":"//myanimelist.net/anime/1","thumb":"","firstCharacter":"character1","characters":[{"name":"character1","main":true}],"title":"1"}]');
     Anime.activeSeiyuu = 22;
     expect(JSON.stringify(service['sharedAnime'](hashOfRoles, "!main"))).toBe('[{"_id":1,"rolesBySeiyuu":{"11":[{"name":"character1","main":true,"_id":11}],"22":[{"name":"character5","main":false,"_id":22}]},"main":false,"link":"//myanimelist.net/anime/1","thumb":"","firstCharacter":"character5","characters":[{"name":"character5","main":false}],"title":"1"}]');
    }
  );
  it('makeChart([...]) should display chart for 3 seiyuu', inject([SeiyuuService],
    ( ) => {
    let spy = spyOn(service, 'loadDetails').and.returnValue(of({}));
    let x, hash = [...hashOfRoles];
    hash.push({
        '3': [{
          name: 'character8',
          main: true,
          _id: 33
        },{
          name: 'character9',
          main: false,
          _id: 33
        }],
        '5': [{
          name: 'character10',
          main: false,
          _id: 33
        }]
      });
    service.displayChart$.subscribe(_ => x=_);
    service['makeChart'](hash);

    Anime.activeSeiyuu = 11;
    expect(JSON.stringify(x)).toBe('[[[],[{"_id":2,"rolesBySeiyuu":{"11":[{"name":"character2","main":true,"_id":11}],"22":[{"name":"character2","main":true,"_id":22}]},"main":true,"link":"//myanimelist.net/anime/2","thumb":"","firstCharacter":"character2","characters":[{"name":"character2","main":true}],"title":"2"}],[]],[[{"_id":1,"rolesBySeiyuu":{"11":[{"name":"character1","main":true,"_id":11}],"22":[{"name":"character5","main":false,"_id":22}]},"main":true,"link":"//myanimelist.net/anime/1","thumb":"","firstCharacter":"character1","characters":[{"name":"character1","main":true}],"title":"1"}],[],[]],[[{"_id":3,"rolesBySeiyuu":{"11":[{"name":"character4","main":false,"_id":11}],"33":[{"name":"character8","main":true,"_id":33},{"name":"character9","main":false,"_id":33}]},"main":false,"link":"//myanimelist.net/anime/3","thumb":"","firstCharacter":"character4","characters":[{"name":"character4","main":false}],"title":"3"}],[],[]]]');
    expect(spy).toHaveBeenCalledWith([ 1, 2, 3 ]);
   })
  );


  it('loadDetails() should request data', inject([RestService],
    (rest: RestService ) => {
    let spy = spyOn(rest, 'mongoCall').and.returnValue(of([{_id:1}])),
      x;
    expect(Anime.detailsCache[1]).toBeFalsy();

    service['loadDetails']([1,2,3]).subscribe(_ => x=_);

    expect(spy).toHaveBeenCalledWith({
      coll: 'anime',
      mode: 'GET',
      query: {
        f: {title: 1, pic: 1},
        q: {'_id': {'$in': [1,2,3]}}
      }
    });
    expect(Anime.detailsCache[1]).toBeTruthy();

    service['loadDetails']([ ]).subscribe(_ => x=_) ;
    expect(x.length).toBeFalsy();
   })
  );


  it('should call makeChart and load details if chart is enabled w/o redundant calls',
    inject([SeiyuuService, RestService, BusService],
      (seiyuuSvc:SeiyuuService, rest: RestService, bus: BusService) => {
        let y;

        let loaded = Object.assign({}, model);
        loaded.roles.push(...roles);
        let spy1 = spyOn<any>(service, 'makeChart').and.callThrough();
        let spy2 = spyOn<any>(service, 'loadDetails').and.returnValue(of({}));

        let loaded2 = Object.assign({}, model2);
        loaded2.roles.push({
          "name": "Character 1",
          "main": true,
          "_id": 2
        },{
          "name": "Character 3",
          "main": false,
          "_id": 3
        },{
          "name": "Character 4",
          "main": false,
          "_id": 4
        });
        bus.toggleChart = true;
        seiyuuSvc.loadedSeiyuu$.next([new Seiyuu(loaded),new Seiyuu(loaded2)]);

        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalledTimes(1);

        spy1.calls.reset();
        spy2.calls.reset();

        bus.toggleChart = false;
        seiyuuSvc.loadedSeiyuu$.next([new Seiyuu(loaded),new Seiyuu(loaded2)]);

        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalledTimes(2);
      }));

});
