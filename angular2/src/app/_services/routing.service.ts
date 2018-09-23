import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {Utils} from "./utils.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class RoutingService {
  routeId$: BehaviorSubject<number[]> = new BehaviorSubject([]);
  paramMap$ = new Subject<any>();
  tab$ = new Subject<string>();

  private tab: string = '';

  constructor(private router: Router) {
   this.router.events
     .filter(e => e instanceof NavigationEnd)
     .map((e: any) => e.urlAfterRedirects.split('/')[1])
     .do(t => this.tab = t)
     .distinctUntilChanged()                                                                              .do(Utils.lg('tab'))
     .subscribe(this.tab$);

    this.paramMap$                                                                                        .do(Utils.asrt('paramMap'))
     .map(params => (params.get('ids') || ''))
     .distinctUntilChanged()
     .map(ids => ids.split(',')
        .map(el => +el.replace(/\D/g, ''))
        .filter(el => !!el)
     ).subscribe(this.routeId$);
  }

  add(id): number {
    const newList = Utils.unique([...this.routeId$.getValue(), id]);
    this.router.navigate([this.tab, newList.join(',')]);
    // was it a duplicate?
    return this.routeId$.getValue().length === newList.length ? id : null;
  }

  remove(id) {
    const newList = this.routeId$.getValue().filter(el => el !== id);

    return this.router.navigate([this.tab, newList.join(',')]);
  }

  runOnTab<T>(tabName: string): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> => {
      return source
        .combineLatest(this.tab$)
        .filter(([,tab]) => tab == tabName)
        .map(([seiyuus,]) => seiyuus)                                                 .do(Utils.asrt(`runOnTab[${tabName}]`, x => !x[0] || x[0].name));
    }
  }

  replayOnTab<T>(tabName: string): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> => {
      return source
        .combineLatest(this.tab$.filter(tab => tab == tabName))
        .map(([data,]) => data)                                                        .do(Utils.asrt(`replayOnTab[${tabName}]`))
    }
  }
}
