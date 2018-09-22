import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {env} from "../../environments/environment";

import {RestService} from "./rest.service";
import {SeiyuuService} from "./seiyuu.service";
import {Utils} from "./utils.service";
import {RoutingService} from "./routing.service";
import {MessagesService} from "./messages.service";
import {Seiyuu} from "../_models/seiyuu.model";

interface PhotoPage {
  html?: string;
  next?: boolean;
  prev?: boolean;
  pageNum?: number;
  total?: string|number;
}

@Injectable()
export class PhotoService {
  displayPhotos$: BehaviorSubject<PhotoPage> = new BehaviorSubject({});
  pending: boolean;

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
      .combineLatest(this.pageDelta)                                                                   .do(Utils.lg('photoPage'))
      .switchMap(([names,]) => this.wrapper(names))
      .do(() => this.pending = false)
      .let(this.routingSvc.replayOnTab('photos'))
      .do(page => {
        if (page.total)
          this.messageSvc.status(`${page.total} image${Utils.pluralize(page.total)} found`);
      })
      .subscribe(this.displayPhotos$);
  }

  nextPage() {
    this.pageDelta.next(1);
  }
  prevPage() {
    this.pageDelta.next(-1);
  }

  private wrapper(names: string[]): Observable<PhotoPage> {
    let hasNames = !!names.length;
    if (names.length == 1) names.push('solo');

    let tags = names.join('+').toLowerCase().replace(/\s+/g, '_');
    let key = tags + '++' + this.page;

    this.messageSvc.blank();

    return hasNames ?
      this.cache[key] ?
        Observable.of(this.cache[key]) :
        this.getPhotoPage(tags)
          .do(data => this.cache[key] = data) :
      Observable.of({html:'', next: false, prev: false, pageNum: 0, total: 0});
  }

  private getPhotoPage(tags: string): Observable<PhotoPage> {
    this.pending = true;

    return this.rest.yahooQueryCall(tags, this.page*20)                                            .do(Utils.lg('Photos requested', 'warn'))
      .catch(error => {
        setTimeout(() => this.messageSvc.error(error.message));
        return Observable.of({data:'', paging:''});
      })
      .map(({data, paging}) => {
        let rawhtml =  data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        let newDoc = document.implementation.createHTMLDocument('newDoc');
        newDoc.documentElement.innerHTML = rawhtml;
        let spans = newDoc.querySelectorAll('span.thumb');
        let total: any = 'no';

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
          pageNum: this.page,
          total,
          next: spans.length == 20,
          prev: this.page > 0
        };
      });
  }

}
