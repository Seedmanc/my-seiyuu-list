import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {Subject} from "rxjs/Subject";
import {SeiyuuService} from "./seiyuu.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Utils} from "./utils.service";
import {env} from "../../environments/environment";
import 'rxjs/add/operator/switchMap';

@Injectable()
export class PhotoService {
  displayPhotos$: Subject<any> = new Subject();
  pageDelta: BehaviorSubject<number> = new BehaviorSubject(0);
  pending: boolean;

  private page: number = 0;

  constructor(private rest: RestService,
              private seiyuuSvc: SeiyuuService) {

    this.pageDelta
      .subscribe(delta => this.page = Math.max(0, this.page+delta));

    this.seiyuuSvc.loadedSeiyuu$                                                                      .do(Utils.log('loadedInside'))
      .do(() => this.page = 0)
      .map(seiyuus => seiyuus.map(seiyuu => seiyuu.name))
      .combineLatest(this.pageDelta)                                                                   .do(Utils.log('photoPage'))
      .switchMap(([names,]) => {
        return this.getPhotoPage(names.join('+').toLowerCase().replace(/\s+/g, '_'), this.page*20);
      })
      .do(() => this.pending = false)
      .subscribe(this.displayPhotos$)
  }

  private getPhotoPage(tags: string, pid: number): Observable<{page: string, next: boolean, prev: boolean}> {
    this.pending = true;
    tags += '+solo';

    return this.rest.yahooQueryCall(tags, pid)
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

        if (spans.length < 20 && tags) {
          let moreTags = '~' + tags.replace('+solo', '').replace(/\+/g, '+~');
          let template = [
            '<div class="more">more at</div>',
              '<b>',
                  `<a href="${env.koeurl}${moreTags}" target="_blank">`,
                      'koe.booru.org',
                  '</a>',
              '</b>'
          ].join('');
          let span = document.createElement('span');
          span.className = 'thumb img-thumbnail';
          span.innerHTML = template;
          newDoc.body.appendChild(span);
        }

        return {
          page: newDoc.body.innerHTML,
          next: spans.length == 20,
          prev: pid > 0
        };
      })
  }

}
