import {TestBed, inject} from '@angular/core/testing';
import {HttpClient} from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {RestService} from "../rest.service";
import {env} from "../../../environments/environment";
import {of} from "rxjs/observable/of";
import {EMPTY} from "rxjs";
import {_throw} from "rxjs/observable/throw";

const mkresponse = /*'handleJsonp(*/{"version":"0.6","reqId":"0","status":"ok","sig":"229708994","table":{"cols":[{"id":"A","label":"","type":"string"},{"id":"B","label":"","type":"string"},{"id":"C","label":"","type":"string"}],"rows":[]}}/*)';*/

describe('RestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  it('mongoCall should make a GET to the specified DB',
    inject([RestService, HttpTestingController], (service:RestService, backend:HttpTestingController) => {
      service.mongoCall({coll:'seiyuu-test',mode:'GET',query:{c:true}}).subscribe(data => expect(data).toEqual(7));
      backend.expectOne({
        url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&c=true`,
        method:'GET'
      }, 'GET to count the # of records in the seiyuu DB').flush(7);
    })
   );

 /* xit('mongoCall should make a runCommand to the specified DB',
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
   );*/

  it('mongoCall should make a PUT to the specified DB',
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
  );

  it('apifyCall should request photos for seiyuu',
    inject([RestService, HttpClient], (service:RestService, http: HttpClient) => {

    let spy = spyOn(http, 'post').and.returnValue(of(''));

    service.apifyCall('davidyuk_jenya+solo', 0);

    expect(spy).toHaveBeenCalled();
    expect(spy.calls.mostRecent().args[0]).toBe(`https://api.apify.com/v2/actor-tasks/seedmanc~cheerio-koebooru/run-sync?token=oHqw26JcyWpKugLcrdxRtNSdJ`);
    expect(JSON.stringify(spy.calls.mostRecent().args[1])).toBe('{"url":"https://koe.booru.org/index.php?page=post&s=list&tags=davidyuk_jenya+solo&pid=0"}');
   })
  );

   it('apifyCall should handle errors',
    inject([RestService, HttpClient], (service:RestService, http: HttpClient) => {
    let erresponse: any = {success: false};

    let spy = spyOn(http, 'post').and.returnValue(of(erresponse));

    service.apifyCall('whatever', 0)
      .catch(err =>{
        expect(JSON.stringify(err)).toBe(JSON.stringify({message: 'Couldn\'t load the photos, try the koebooru link'}));
        return <any>EMPTY;
      })
      .subscribe( );

     expect(spy).toHaveBeenCalled();
    })
  );

  it('googleQueryCall should request magazine data',
    inject([RestService, HttpClient], (service:RestService, http: HttpClient) => {

      let spy = spyOn(http, 'jsonp').and.returnValue(of(mkresponse));

      service.googleQueryCall(['Maeda Konomi','Davidyuk Jenya'])
        .subscribe(data =>
          expect(JSON.stringify(data)).toBe('{"version":"0.6","reqId":"0","status":"ok","sig":"229708994","table":{"cols":[{"id":"A","label":"","type":"string"},{"id":"B","label":"","type":"string"},{"id":"C","label":"","type":"string"}],"rows":[]}}')
        );

      expect(spy).toHaveBeenCalled();
    })
  );
});
