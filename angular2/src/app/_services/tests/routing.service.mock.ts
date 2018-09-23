import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {Utils} from "../utils.service";

@Injectable()
export class RoutingServiceMock {
  public routeId$: BehaviorSubject<number[]>  = new BehaviorSubject([]);
  public tab$: BehaviorSubject<string>  = new BehaviorSubject('anime');
  public paramMap$: BehaviorSubject<any>  = new BehaviorSubject({get(){return 0}});

  constructor() {
  }

  add(id): number {
    let list = this.routeId$.getValue();
    let newList = Utils.unique([...list, id]);
    // was it a duplicate?
    if (list.length !== newList.length ) this.routeId$.next(newList);
    console.log(arguments);
    return list.length == newList.length ? id : null;
  }

  remove(id) {
    let newList = this.routeId$.getValue().filter(el => el !== id);
    if (this.routeId$.getValue().length !== newList.length ) this.routeId$.next(newList);
    console.log(arguments);
  }

  runOnTab<T>(tabName: string): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> => {
      return source
        .combineLatest(this.tab$)
        .filter(([,tab]) => tab == tabName)
        .map(([seiyuus,]) => seiyuus)                                                 .do(Utils.asrt(`runOnTab[${tabName}]`, x => !x[0] || x[0].name));
    }
  }
}
