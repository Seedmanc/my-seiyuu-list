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
import {model} from "../../_models/tests/seiyuu.model.spec";
import {Seiyuu} from "../../_models/seiyuu.model";

let x;
describe('AnimeService', () => {
  x = undefined;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimeService, RestService, MessagesService, SeiyuuService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports: [
        HttpClientModule, HttpClientTestingModule
      ],
    });
  });

  it('should be created', inject([AnimeService], (service: AnimeService) => {
    expect(service).toBeTruthy();
  }));

  it('should fetch the record count from anime db',
    inject([AnimeService, HttpTestingController], (service:AnimeService, backend:HttpTestingController) => {
      service.animeCount$.subscribe(data => expect(data).toEqual(4286));
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
      let spy = spyOn(msgSvc, 'status');

      service.displayAnime$.subscribe(data => x = data);
      service.selected$.subscribe(data => y = data);

      let loaded = Object.assign({}, model);
      loaded.roles.push({
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
      },);
      seiyuuSvc.loadedSeiyuu$.next([new Seiyuu(loaded)]);

      expect(y).toBe(model._id);
      expect(spy).toHaveBeenCalledWith('4 anime found');
      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime?apiKey=${env.apiKey}&f={"title":1,"pic":1}&q={"_id":{"$in":[1,2,3,2829]}}`,
        method:'GET'
      }, 'GET to count the # of records in the anime DB').flush([
          {_id:2829, title: 'Ie Naki Ko Remi', pic:'/images/anime/12/26250v.jpg'},
          {_id:1, title: 'title 1', pic:'pic1.jpg'},
          {_id:2, title: 'title 2', pic:'pic2.jpg'},
          {_id:3, title: 'title 3', pic:'pic3.jpg'},
        ]
      );

      expect(JSON.stringify(x[3])).toBe('{"_id":2829,"rolesBySeiyuu":{"578":[{"name":"Pierre","main":false,"_id":578}]},"main":false,"link":"//myanimelist.net/anime/2829","thumb":"//myanimelist.net/images/anime/12/26250v.jpg","mainCharacter":"Pierre","characters":[{"name":"Pierre","main":false}],"title":"Ie Naki Ko Remi"}')
    })
  )
});
