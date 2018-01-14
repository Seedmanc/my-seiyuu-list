import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";

@Injectable()
export class RoutingService {
  private mode: string = '';
  public routeId$: Observable<number[]>;

  constructor(private router: Router, private route: ActivatedRoute) {
   this.router.events
      .filter(e => e instanceof NavigationEnd)
      .subscribe((e:any) => this.mode = e.urlAfterRedirects.split('/').reverse()[0]);

   this.routeId$ = this.route.paramMap
      .map(params => params.get('ids').split(',').map(el => +el.replace(/\D/g, '')).filter(el=>!!el));
  }

  add(id, list) {
    let newList = [...list, id].filter((el, i, arr) => arr.indexOf(el) === i);
    this.router.navigate(['/'+newList.join(','), this.mode]);
  }

  remove(id, list) {
    let newList = list.filter(el => el !== id);
    this.router.navigate(['/'+(newList.join(',')||'-'), this.mode]);
  }

}
