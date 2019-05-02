import {RoutingService} from "../_services/routing.service";
import {ActivatedRoute } from "@angular/router";
import {OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs/Subject";

export class PageComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();

  constructor(protected route: ActivatedRoute, protected routingSvc: RoutingService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(this.routingSvc.paramMap$);
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
  }

}
