import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {SeiyuuService} from "./seiyuu.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Utils} from "./utils.service";
import {RoutingService} from "./routing.service";
import {env} from "../../environments/environment";
import {MessagesService} from "./messages.service";

@Injectable()
export class PhotoService {
  displayPhotos$: BehaviorSubject<any> = new BehaviorSubject({});
  pageDelta: BehaviorSubject<number> = new BehaviorSubject(0);
  pending: boolean;

  private page: number = 0;
  private cache = {};

  constructor(private rest: RestService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService,
              private msgSvc: MessagesService) {

    this.pageDelta
      .subscribe(delta => this.page = Math.max(0, this.page+delta));

    this.seiyuuSvc.displaySeiyuu$                                                                       .do(Utils.log('loadedToPhotos'))
      .do(() => this.page = 0)
      .filter(list => list)
      .combineLatest(this.routingSvc.tab$)
        .filter(([,tab]) => tab == 'photos')                                                           .do(Utils.log('b4distinct'))
        .distinctUntilChanged(([x,],[y,]) => Utils.compareLists(x, y))
        .map(([seiyuus,]) => seiyuus)
      .map(seiyuus => seiyuus.map(seiyuu => seiyuu.name))
      .combineLatest(this.pageDelta)                                                                   .do(Utils.log('photoPage'))
      .switchMap(([names,]) => this.wrapper(names))
      .do(() => this.pending = false)
      .subscribe(this.displayPhotos$);
  }

  private wrapper(names: string[]) {
    let hasNames = !!names.length;
    if (names.length == 1) names.push('solo');

    let tags = names.join('+').toLowerCase().replace(/\s+/g, '_');
    let key = tags + '++' + this.page;

    return hasNames ?
      this.cache[key] ?
        Observable.of(this.cache[key]) :
        this.getPhotoPage(tags)
          .do(data => this.cache[key] = data) :
      Observable.of({html:'', next: false, prev: false, pageNum: 0, total: 0});
  }

  private getPhotoPage(tags: string): Observable<{html: string, next: boolean, prev: boolean, pageNum: number, total: string}> {
    this.pending = true;

    return this.rest.yahooQueryCall(tags, this.page*20)
      .do(Utils.lg('photos requested', 'warn'))
      .catch(error => {
        setTimeout(() => this.msgSvc.error(error.message));
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
