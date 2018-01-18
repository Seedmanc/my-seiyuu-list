import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";

@Injectable()
export class AnimeService {
  animeCount$: Observable<number>;

  constructor(private rest: RestService) {
    this.animeCount$ = this.rest.mongoCall({
      coll: 'anime',
      mode: 'get',
      query: {c: true}
    });
  }

}
