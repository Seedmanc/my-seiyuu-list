import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {env} from "../../environments/environment";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

interface ApifyResponse {
  success: boolean;
  thumbs: string;
  paginator: string;
}

interface GoogleQresponse {
  status: string;
  table?: {
    cols: any[];
    rows: {
      c: {v: string}[]
    }[]
  };
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


@Injectable({providedIn:'root'})
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
  }

  googleQueryCall(names: string[]): Observable<GoogleQresponse> {
    let subject: Subject<GoogleQresponse> = new Subject();
    let contains = names.map(name => `C contains '${name}'`).join(' AND ');

    const document = '1C4mrBWJxPLrFQ4bp82UA2ICOr1e6ER47wF7YuElyoZg';
    const sheet = '1655460507';

    // muh callback is not defined, muh CORS
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

  apifyCall(tags: string, pid: number): Observable<any> {
    let koeurl = `${env.koeurl}${tags}&pid=${pid}`;

    return this.http.post<ApifyResponse>(
      'https://api.apify.com/v2/actor-tasks/seedmanc~cheerio-koebooru/run-sync?token=oHqw26JcyWpKugLcrdxRtNSdJ',
      {url: koeurl}
    )
      .map(response => {
        return {data: response.thumbs, paging: response.paginator};
      });
  }
}
