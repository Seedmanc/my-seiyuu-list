import { Injectable } from '@angular/core';
import {BasicSeiyuu} from "../models/seiyuu.model";
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";

@Injectable()
export class SeiyuuService {
  basicList$: Observable<BasicSeiyuu[]>;

  constructor(private rest:RestService) {

    this.basicList$ = this.rest.mongoCall({
      coll: 'seiyuu',
      mode: 'get',
      query: {
        f: {name: 1, hits: 1, updated: 1, count: 1, accessed: 1},
        s: {name: 1}
      }
    }).map(list => list.map(seiyuu => {
      return {...seiyuu,
        updated: new Date(seiyuu.updated),
        accessed: seiyuu.accessed && new Date(seiyuu.accessed) || new Date(seiyuu.updated)
      }
    })).share();

  }

}
