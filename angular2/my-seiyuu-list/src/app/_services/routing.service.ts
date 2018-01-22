import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {Utils} from "./utils.service";

@Injectable()
export class RoutingService {
  private mode: string = '';
  public routeId$: Observable<number[]>;

  constructor(private router: Router, private route: ActivatedRoute) {
   this.router.events
      .filter(e => e instanceof NavigationEnd)
      .subscribe((e:any) => this.mode = e.urlAfterRedirects.split('/').reverse()[0]);

   this.routeId$ = this.route.paramMap
     .map(params => (params.get('ids')||'-').split(',')
        .map(el => +el.replace(/\D/g, ''))
        .filter(el=>!!el));
  }

  add(id, list): number {
    let newList = Utils.unique([...list, id]);
    this.router.navigate(['/'+newList.join(','), this.mode]);
    // was it a duplicate?
    return list.length == newList.length ? id : null;
  }

  remove(id, list) {
    let newList = list.filter(el => el !== id);
    return this.router.navigate(['/'+(newList.join(',')||'-'), this.mode]);
  }

}
