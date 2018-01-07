import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import "rxjs/Rx";

@Injectable()
export class RestService {
  public pending: boolean;

  constructor(private http: HttpClient) { }

  mongoCall({coll, mode, payload=undefined, query={}}) {
    let path = "collections/" + coll;

    if (mode == "runCommand") {
      path = mode;
      mode = "post";
    }

    let options = Object.keys(query).reduce((total, key) => total + `&${key}=${encodeURIComponent(JSON.stringify(query[key]))}`, '');

    this.pending = true;

    return this.http[mode](
      `https://api.mongolab.com/api/1/databases/myseiyuulist/${path}?apiKey=R4jg8qqhpTI68lRYfYjEJoM5aRiJnrLK${options}`,
      payload
    ).do(_ => this.pending = false);


/*        if (failCount <= 2) {
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
