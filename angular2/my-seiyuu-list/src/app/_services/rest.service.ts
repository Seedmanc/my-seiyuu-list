import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import "rxjs/Rx";

@Injectable()
export class RestService {

  constructor(private http: HttpClient) { }

  mongoCall({coll, mode, payload=undefined, query={}}) {
    let path = "collections/" + coll;

    if (mode == "runCommand") {
      path = mode;
      mode = "post";
    }

    let options = Object.keys(query).reduce((total, key) => total + `&${key}=${JSON.stringify(query[key])}`, '');

    return this.http[mode](
      `https://api.mongolab.com/api/1/databases/myseiyuulist/${path}?apiKey=R4jg8qqhpTI68lRYfYjEJoM5aRiJnrLK${options}`,
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
