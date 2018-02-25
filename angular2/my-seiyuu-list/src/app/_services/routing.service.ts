import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {Utils} from "./utils.service";
import {Subject} from "rxjs/Subject";

@Injectable()
export class RoutingService {
  routeId$: Subject<number[]> = new Subject();
  paramMap$ = new Subject<any>();
  private mode: string = '';

  constructor(private router: Router) {
   this.router.events
      .filter(e => e instanceof NavigationEnd)                                   .do(Utils.lg('mode'))
      .subscribe((e: any) => this.mode = e.urlAfterRedirects.split('/')[1]);

    this.paramMap$                                                               .do(Utils.log('parammap'))
     .map(params => (params.get('ids')||''))
     .distinctUntilChanged()
     .map(ids => ids.split(',')
        .map(el => +el.replace(/\D/g, ''))
        .filter(el => !!el)
     ).subscribe(this.routeId$);
  }

  add(id, list): number {
    const newList = Utils.unique([...list, id]);
    this.router.navigate([this.mode, newList.join(',')]);
    // was it a duplicate?
    return list.length === newList.length ? id : null;
  }

  remove(id, list) {
    const newList = list.filter(el => el !== id);

    return this.router.navigate([this.mode, newList.join(',')]);
  }

}
