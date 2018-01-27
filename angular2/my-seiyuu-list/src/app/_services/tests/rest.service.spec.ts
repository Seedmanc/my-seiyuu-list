import {TestBed, inject} from '@angular/core/testing';
import { HttpClientModule} from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {RestService} from "../rest.service";
import {env} from "../../../environments/environment";

describe('RestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestService],
      imports: [
        HttpClientModule, HttpClientTestingModule
      ],
    });
  });

  it('should be created', inject([RestService], (service: RestService) => {
    expect(service).toBeTruthy();
  }));

  it('should make a GET to the specified DB',
    inject([RestService, HttpTestingController], (service:RestService, backend:HttpTestingController) => {
      service.mongoCall({coll:'seiyuu-test',mode:'GET',query:{c:true}}).subscribe(data => expect(data).toEqual(7));
      backend.expectOne({
        url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&c=true`,
        method:'GET'
      }, 'GET to count the # of records in the seiyuu DB').flush(7);
    })
   );

  it('should make a runCommand to the specified DB',
    inject([RestService, HttpTestingController], (service:RestService, backend:HttpTestingController) => {
      let date = +(new Date());
      let model = {
        _id: 53,
        name: 'Chihara Minori',
        hits: 68,
        count: 3,
        accessed: date
      };
      service.mongoCall({
        coll: 'seiyuu-test',
        mode: 'runCommand',
        payload: {
          findAndModify: "seiyuu-test",
          query: {_id: 53},
          update: {
            $inc: {hits: 1},
            $set: {accessed: date}
          },
          'new': true,
          fields: {"roles.name": 0}
        }
      }).subscribe(data => expect(JSON.stringify(data)).toEqual(JSON.stringify(model)));
      // not sure about the point of this repetition

      backend.expectOne({
        url: `${env.mongoUrl}/runCommand?apiKey=${env.apiKey}`,
        method:'POST'
      }, 'POST to run command on the seiyuu DB').flush(model);
    })
   );

  it('should make a PUT to the specified DB',
    inject([RestService, HttpTestingController], (service:RestService, backend:HttpTestingController) => {

      service.mongoCall({
        coll: 'anime-test',
        mode: 'PUT',
        payload: {'$addToSet': {'vas': 53}},
        query: {
          q: {"_id": {"$in": [0]}},
          m: true
        }
      }).subscribe(data => expect(JSON.stringify(data)).toBeTruthy());

      backend.expectOne({
        url: `${env.mongoUrl}/collections/anime-test?apiKey=${env.apiKey}&q={"_id":{"$in":[0]}}&m=true`,
        method:'PUT'
      }, 'PUT to anime DB').flush({});
    })
  )
});
