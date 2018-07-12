import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {Utils} from "./utils.service";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class RoutingService {
  routeId$: BehaviorSubject<number[]> = new BehaviorSubject([]);
  paramMap$ = new Subject<any>();
  tab$ = new Subject<string>();

  private tab: string = '';

  constructor(private router: Router) {
   this.router.events
     .filter(e => e instanceof NavigationEnd)                                                             .do(Utils.lg('tab'))
     .map((e: any) => e.urlAfterRedirects.split('/')[1])
     .do(t => this.tab = t)
     .subscribe(this.tab$);

    this.paramMap$                                                                                         .do(Utils.log('paramMap'))
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

}
