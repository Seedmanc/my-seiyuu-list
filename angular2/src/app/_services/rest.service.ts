import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {env} from "../../environments/environment";
import {Observable} from "rxjs/Observable";

interface YQLresponse {
  query: {
    count: number,
    results: {
      result: string[]
    }
  }
}

@Injectable()
export class RestService {

  constructor(private http: HttpClient) { }

  mongoCall({coll, mode, payload={}, query={}}): Observable<any> {
    let path = "collections/" + coll;

    if (JSON.stringify(payload) === '{}') {
      payload = undefined;
    }

    if (mode === "runCommand") {
      path = mode;
      mode = "POST";
    }

    const options = Object.keys(query).reduce((total, key) => total + `&${key}=${JSON.stringify(query[key])}`, '');

    return this.http[mode.toLowerCase()](
      `${env.mongoUrl}/${path}?apiKey=${env.apiKey}${options}`,
      payload
    );

/*        if ( failCount <= 2) {
        failCount++;
$scope.debug += '\n\r' + JSON.stringify(error) + ' Error accessing database.';
        mongoCall(
          'errors',
          'POST',
          {
            date: new Date(),

            source: 'mongoCall',
            args:   {coll: coll, mode: mode, data: data, query: query},

            browser: navigator.userAgent,

            error:   error,
            comment: 'ajax call fail ' + failCount
          }
        );
      }*/

  }

  yahooQueryCall(tags: string, pid: number): Observable<YQLresponse> {
    let koeurl = encodeURIComponent(`${env.koeurl}${tags}&pid=${pid}`);

    return this.http.get<YQLresponse>([
      'https://query.yahooapis.com/v1/public/yql?q=',
        `SELECT * FROM htmlstring WHERE url = '${koeurl}' AND xpath IN (`,
          `'//div[@id="tag_list"]//h5',`,
          `'//div[@class = "content"]//span[@class = "thumb"]'`,
        ')',
        '&format=json',
        '&env=store://datatables.org/alltableswithkeys'
      ].join('')
    )
  }

}
