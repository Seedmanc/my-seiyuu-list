import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import "rxjs/Rx";
import {env} from "../../environments/environment";

@Injectable()
export class RestService {

  constructor(private http: HttpClient) { }

  mongoCall({coll, mode, payload={}, query={}}) {
    let path = "collections/" + coll;

    if (JSON.stringify(payload) === '{}') {
      payload = undefined;
    }

    if (mode == "runCommand") {
      path = mode;
      mode = "POST";
    }

    let options = Object.keys(query).reduce((total, key) => total + `&${key}=${JSON.stringify(query[key])}`, '');

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

}
