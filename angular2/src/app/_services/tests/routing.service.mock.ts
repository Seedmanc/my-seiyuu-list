import {Injectable} from '@angular/core';
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

}
