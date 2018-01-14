import {Injectable} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

@Injectable()
export class RoutingService {
  private mode: string = '';

  constructor(private router: Router) {
   this.router.events
      .filter(e => e instanceof NavigationEnd)
      .subscribe((e:any) => this.mode = e.urlAfterRedirects.split('/').reverse()[0]);
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
