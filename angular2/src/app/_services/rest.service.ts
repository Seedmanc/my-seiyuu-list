import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {env} from "../../environments/environment";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

interface YQLresponse {
  query: {
    count: number,
    results: {
      result: string[]
    }
  };
}

interface GoogleQresponse {
  status: string,
  table?: {cols: any[],
    rows: {
      c: {v: string}[]
    }[]
  },
  error?: any
}

interface MongoCall {
  coll: string;
  mode: 'GET'|'POST'|'runCommand'|'PUT';
  query?: {
    f?: {[key:string]: 1};
    s?: {[key:string]: 1};
    q?: any,
    m?: boolean;
    c?: boolean;
  };
  payload?: any;
}

@Injectable()
export class RestService {

  constructor(private http: HttpClient) { }

  mongoCall({coll, mode, payload={}, query={}}: MongoCall): Observable<any> {
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

  yahooQueryCall(tags: string, pid: number): Observable<any> {
    let koeurl = encodeURIComponent(`${env.koeurl}${tags}&pid=${pid}`);


    return this.http.get<YQLresponse>([
      'https://query.yahooapis.com/v1/public/yql?q=',
        `SELECT * FROM htmlstring WHERE url = '${koeurl}' AND xpath IN (`,
          `'//div[@id="tag_list"]//h5',`,
          `'//div[@class = "content"]//span[@class = "thumb"]',`,
          `'//div[@id="paginator"]'`,
        ')',
        '&format=json',
        '&env=store://datatables.org/alltableswithkeys'
      ].join('')
    ).map(response => {
      if (!response.query || !response.query.count || !response.query.results.result[0] || !response.query.results)
        throw({message: 'Couldn\'t load the photos, try the koebooru link'});
      //TODO global error reporting
      return {data: response.query.results.result[1], paging: response.query.results.result[2]};
    });
  }

  googleQueryCall(names: string[]): Observable<GoogleQresponse> {
    let subject: Subject<GoogleQresponse> = new Subject();
    let contains = names.map(name => `C contains '${name}'`).join(' AND ');

    const document = '1C4mrBWJxPLrFQ4bp82UA2ICOr1e6ER47wF7YuElyoZg';
    const sheet = '1655460507';

    // muh callback in not defined, muh CORS
    window['handleJsonp'] = x => subject.next(x);
    // because fuck you, that's why

    return this.http.jsonp<GoogleQresponse>([
      `https://docs.google.com/spreadsheets/d/${document}/gviz/tq?gid=${sheet}&tq=`,
        'SELECT A,B,C WHERE ',
        contains,
      '&tqx=responseHandler:handleJsonp'
      ].join(''),
      ''
    ).merge(subject);
  }

}
