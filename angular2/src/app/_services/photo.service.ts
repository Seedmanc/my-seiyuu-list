import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";

@Injectable()
export class PhotoService {

  constructor(private rest: RestService) { }

  getPhotoPage(tags: string[], pid: number): Observable<string> {
    return this.rest.yahooQueryCall(
      tags.join('+').toLowerCase().replace(/\s+/g, '_'),
      pid
    )
      .map(result => {
        return result.query.results.result[1]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/class="thumb"/g, 'class="thumb img-thumbnail"');
      })
  }

}
