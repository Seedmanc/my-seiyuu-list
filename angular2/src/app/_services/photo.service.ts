import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {SeiyuuService} from "./seiyuu.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Utils} from "./utils.service";
import {RoutingService} from "./routing.service";
import {env} from "../../environments/environment";
import 'rxjs/add/operator/switchMap';

@Injectable()
export class PhotoService {
  displayPhotos$: BehaviorSubject<any> = new BehaviorSubject({});
  pageDelta: BehaviorSubject<number> = new BehaviorSubject(0);
  pending: boolean;

  private page: number = 0;
  private cache = {};

  constructor(private rest: RestService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService) {

    this.pageDelta
      .subscribe(delta => this.page = Math.max(0, this.page+delta));

    this.seiyuuSvc.loadedSeiyuu$                                                                       .do(Utils.log('loadedToPhotos'))
      .do(() => this.page = 0)
      .filter(list => list)
      .combineLatest(this.routingSvc.tab$)
        .filter(([,tab]) => tab == 'photos').do(Utils.log('b4distinct'))                               .do(Utils.log('b4distinct'))
        .distinctUntilChanged(([x,],[y,]) => Utils.compareLists(x,y))
        .map(([seiyuus,]) => seiyuus)
      .map(seiyuus => seiyuus.map(seiyuu => seiyuu.name))
      .combineLatest(this.pageDelta)                                                                   .do(Utils.log('photoPage'))
      .switchMap(([names,]) => this.wrapper(names))
      .do(() => this.pending = false)
      .subscribe(this.displayPhotos$)
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
      Observable.of({page:'', next: false, prev: false});
  }

  private getPhotoPage(tags: string): Observable<{page: string, next: boolean, prev: boolean}> {
    this.pending = true;

    return this.rest.yahooQueryCall(tags, this.page*20)
      .do(Utils.lg('photos requested', 'warn'))
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
          prev: this.page > 0
        };
      })
  }

}
