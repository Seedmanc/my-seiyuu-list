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
        let html =  result.query.results.result[1]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        let newDoc = document.implementation.createHTMLDocument('newDoc');
        newDoc.documentElement.innerHTML = html;
        let spans  = newDoc.querySelectorAll('span.thumb');

        [].slice.call(spans)
          .forEach(span => {
            span.classList.add('img-thumbnail');
            let a = span.querySelector('a');
            let img = span.querySelector('img');
            a.href = img.src.replace('thumbs', 'img').replace('thumbnails', 'images').replace('thumbnail_', '');
            a.target = "_blank";
          });

        return newDoc.body.innerHTML;
      })
  }

}
