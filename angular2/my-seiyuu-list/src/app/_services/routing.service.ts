import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {Utils} from "./utils.service";
import {Subject} from "rxjs/Subject";

@Injectable()
export class RoutingService {
  routeId$: Observable<number[]>;
  paramMap$ = new Subject<any>();
  private mode: string = '';

  constructor(private router: Router) {
   this.router.events
      .filter(e => e instanceof NavigationEnd)
      .do((e:any) => this.mode = e.urlAfterRedirects.split('/')[1])
     .subscribe(()=>console.log(this.mode));

   this.routeId$ = this.paramMap$
     .map(params => (params.get('ids')||''))
     .distinctUntilChanged()
     .map(ids => ids.split(',')
        .map(el => +el.replace(/\D/g, ''))
        .filter(el=>!!el)
     );
  }

  add(id, list): number {
    let newList = Utils.unique([...list, id]);
    this.router.navigate([this.mode, newList.join(',')]);
    // was it a duplicate?
    return list.length == newList.length ? id : null;
  }

  remove(id, list) {
    let newList = list.filter(el => el !== id);
    return this.router.navigate([this.mode, newList.join(',')]);
  }

}
