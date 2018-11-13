import {TestBed,  inject} from '@angular/core/testing';
import { HttpClientModule} from "@angular/common/http";
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
import {Anime} from "../../_models/anime.model";
import {mockList} from "./seiyuu.service.spec";

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
describe('AnimeService', () => {
  x = undefined;
  beforeEach(() => {
    Anime.detailsCache = {};
    TestBed.configureTestingModule({
      providers: [AnimeService, RestService, MessagesService, SeiyuuService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports: [
        HttpClientModule, HttpClientTestingModule
      ],
    });
  });

  it('should fetch the record count from anime db',
    inject([AnimeService, HttpTestingController], (service:AnimeService, backend:HttpTestingController) => {
      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&c=true`,
        method:'GET'
      }, 'GET to count the # of records in the anime DB').flush(4286);
    })
  );

  it('should display anime for a single seiyuu',
    inject([AnimeService, HttpTestingController, SeiyuuService, MessagesService],
      (service:AnimeService, backend:HttpTestingController, seiyuuSvc:SeiyuuService, msgSvc:MessagesService) => {
    let y;

      service.displayAnime$.subscribe(([data]) => x = data);
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
    inject([AnimeService, HttpTestingController, SeiyuuService, MessagesService],
      (service:AnimeService, backend:HttpTestingController, seiyuuSvc:SeiyuuService, msgSvc:MessagesService) => {
      let y;

      service.displayAnime$.subscribe(([data]) => x = data);
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
      inject([AnimeService, HttpTestingController, SeiyuuService, MessagesService],
        (service:AnimeService, backend:HttpTestingController, seiyuuSvc:SeiyuuService, msgSvc:MessagesService) => {
        let y;

        service.displayAnime$.subscribe(([data]) => x = data);
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

});
