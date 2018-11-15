import {TestBed, inject} from '@angular/core/testing';
import {HttpClient} from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {RestService} from "../rest.service";
import {env} from "../../../environments/environment";
import {of} from "rxjs/observable/of";

const djresponse = {"query":{"count":3,"created":"2018-05-01T12:46:06Z","lang":"ru-RU","results":{"result":["<h5>Tags</h5>","<span class=\"thumb\">\n  <a href=\"index.php?page=post&amp;s=view&amp;id=8380\" id=\"p8380\">\n    <img alt=\"post\" border=\"0\" src=\"http://thumbs.booru.org/koe/thumbnails//8/thumbnail_c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg\" title=\" davidyuk_jenya solo tagme  score:0 rating:Safe\"/>\n  </a>\n  &#13;\n    \n  <script type=\"text/javascript\">\n    <![CDATA[\n    //]]>\n    <![CDATA[<![CDATA[\n    posts[8380] = {'tags':'davidyuk_jenya solo tagme'.split(/ /g), 'rating':'Safe', 'score':0, 'user':'Seedmanc'}\n    //]]]]><![CDATA[>\n    ]]>\n  </script>\n</span>","<div id=\"paginator\">\n  <script type=\"text/javascript\">\n    <![CDATA[\n   //]]>\n    <![CDATA[<![CDATA[\n   filterPosts(posts)\n   //]]]]><![CDATA[>\n   ]]>\n  </script>\n   \n  <b>1</b>\n   \n</div>"]}}};
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

  it('mongoCall should make a runCommand to the specified DB',
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

  it('yahooQueryCall should request photos for seiyuu',
    inject([RestService, HttpClient], (service:RestService, http: HttpClient) => {

    let spy = spyOn(http, 'get').and.returnValue(of(djresponse));

    service.yahooQueryCall('davidyuk_jenya+solo', 0)
      .subscribe(data => expect(JSON.stringify(data)).toBe(JSON.stringify({
        data: `<span class=\"thumb\">\n  <a href=\"index.php?page=post&amp;s=view&amp;id=8380\" id=\"p8380\">\n    <img alt=\"post\" border=\"0\" src=\"http://thumbs.booru.org/koe/thumbnails//8/thumbnail_c24401d03ee551e8a4e08eaafb24ad8fb5cca015.jpg\" title=\" davidyuk_jenya solo tagme  score:0 rating:Safe\"/>\n  </a>\n  &#13;\n    \n  <script type=\"text/javascript\">\n    <![CDATA[\n    //]]>\n    <![CDATA[<![CDATA[\n    posts[8380] = {'tags':'davidyuk_jenya solo tagme'.split(/ /g), 'rating':'Safe', 'score':0, 'user':'Seedmanc'}\n    //]]]]><![CDATA[>\n    ]]>\n  </script>\n</span>`,
        paging: `<div id=\"paginator\">\n  <script type=\"text/javascript\">\n    <![CDATA[\n   //]]>\n    <![CDATA[<![CDATA[\n   filterPosts(posts)\n   //]]]]><![CDATA[>\n   ]]>\n  </script>\n   \n  <b>1</b>\n   \n</div>`
      })));

    expect(spy).toHaveBeenCalledWith(`https://query.yahooapis.com/v1/public/yql?q=SELECT * FROM htmlstring WHERE url = 'http%3A%2F%2Fkoe.booru.org%2Findex.php%3Fpage%3Dpost%26s%3Dlist%26tags%3Ddavidyuk_jenya%2Bsolo%26pid%3D0' AND xpath IN ('//div[@id="tag_list"]//h5','//div[@class = "content"]//span[@class = "thumb"]','//div[@id="paginator"]')&format=json&env=store://datatables.org/alltableswithkeys`);
   })
  );

  it('yahooQueryCall should handle errors',
    inject([RestService, HttpClient], (service:RestService, http: HttpClient) => {
    let erresponse: any = {...djresponse};
    erresponse.count = 0;
    erresponse.query.results.result[0] = null;

    let spy = spyOn(http, 'get').and.returnValue(of(erresponse));

    service.yahooQueryCall('whatever', 0)
      .subscribe(()=>{}, err => expect(JSON.stringify(err)).toBe(JSON.stringify({message: 'Couldn\'t load the photos, try the koebooru link'})));

     expect(spy).toHaveBeenCalledWith(`https://query.yahooapis.com/v1/public/yql?q=SELECT * FROM htmlstring WHERE url = 'http%3A%2F%2Fkoe.booru.org%2Findex.php%3Fpage%3Dpost%26s%3Dlist%26tags%3Dwhatever%26pid%3D0' AND xpath IN ('//div[@id="tag_list"]//h5','//div[@class = "content"]//span[@class = "thumb"]','//div[@id="paginator"]')&format=json&env=store://datatables.org/alltableswithkeys`);
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
