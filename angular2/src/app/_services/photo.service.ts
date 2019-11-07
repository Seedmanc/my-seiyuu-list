import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {env} from "../../environments/environment";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {of} from "rxjs/observable/of";

import {RestService} from "./rest.service";
import {SeiyuuService} from "./seiyuu.service";
import {Utils} from "./utils.service";
import {RoutingService} from "./routing.service";
import {MessagesService} from "./messages.service";
import {Seiyuu} from "../_models/seiyuu.model";

export interface PhotoPage {
  html?: string;
  next?: boolean;
  prev?: boolean;
  pageNum?: number;
  total?: number;
}

@Injectable()
export class PhotoService {
  displayPhotos$: ReplaySubject<PhotoPage> = new ReplaySubject(1);
  pending: boolean;
  pendingNext: boolean;

  private pageDelta: BehaviorSubject<number> = new BehaviorSubject(0);
  private page: number = 0;
  private cache = {};

  constructor(private rest: RestService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService,
              private messageSvc: MessagesService) {

    this.pageDelta
      .subscribe(delta => this.page = Math.max(0, this.page+delta));

    this.seiyuuSvc.displayList$
      .do(() => this.page = 0)
      .let(this.routingSvc.runOnTab<Seiyuu[]>('photos'))
      .map(seiyuus => seiyuus.map(seiyuu => seiyuu.displayName))
      .combineLatest(this.pageDelta, x=>x)                                                                   .do(Utils.lg('photoPage'))
      .do(() => {
        this.pending = true;
      })
      .switchMap(names => this.wrapper(names)
        .do(photoPage => {  // request next page while user is viewing current one
          if (photoPage && photoPage.next && !this.pendingNext) {
            this.pendingNext = true;
            this.wrapper(names, this.page+1)
              .subscribe(() => this.pendingNext = false);
          }
        })
      )
      .do(() => this.pending = false)
      .subscribe(this.displayPhotos$);
  }

  nextPage() {
    this.pageDelta.next(1);
  }
  prevPage() {
    this.pageDelta.next(-1);
  }

  private wrapper(names: string[], pageNum: number = this.page): Observable<PhotoPage> {
    if (!names) return of(null);
    let hasNames = !!(names && names.length);
    if (names.length == 1) names.push('solo');

    let tags = names.map(n => encodeURIComponent(n.replace(/\s+/g, '_')).toLowerCase())
      .join('+');
    let key = tags + '++' + pageNum;

    return hasNames ?
      this.cache[key] ?
        of(this.cache[key]) :
        this.getPhotoPage(tags, pageNum)
          .do(data => this.cache[key] = data) :
      of(null);
  }

  private getPhotoPage(tags: string, pageNum: number): Observable<PhotoPage> {

    return this.rest.apifyCall(tags, pageNum*20)                                            .do(Utils.lg('Photos requested', 'warn'))
      .catch(error => {
        setTimeout(() => this.messageSvc.error(error.message));
        return of({data:'', paging:''});
      })
      .map(({data, paging}) => {
        let newDoc = document.implementation.createHTMLDocument('newDoc');
        newDoc.documentElement.innerHTML = data;
        let spans = newDoc.querySelectorAll('span.thumb');
        let total = 0;

        spans
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
            '<div>more at</div>',
              '<b>',
                  `<a href="${env.koeurl}${moreTags}" target="_blank">`,
                      'koe.booru.org',
                  '</a>',
              '</b>'
          ].join('');
          let span = document.createElement('span');

          span.className = 'thumb more img-thumbnail';
          span.innerHTML = template;
          newDoc.body.appendChild(span);
        }
        let html = newDoc.body.innerHTML;

        if (paging) {
          newDoc.documentElement.innerHTML = paging;
          let pagenums: any = newDoc.querySelector('a[alt="last page"],b:last-child');

          total = pagenums.href ?
            10+Number(pagenums.href.split('pid=')[1]) :
            (Number(pagenums.textContent)-1)*20 + spans.length;
        }

        return {
          html,
          pageNum,
          total,
          next: spans.length == 20,
          prev: pageNum > 0
        };
      });
  }

}
