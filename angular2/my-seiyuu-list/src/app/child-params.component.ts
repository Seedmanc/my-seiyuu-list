import {RoutingService} from "./_services/routing.service";
import {ActivatedRoute } from "@angular/router";
import {OnInit} from '@angular/core';

export class ChildParamsComponent implements OnInit {

  constructor(protected route: ActivatedRoute, protected routingSvc: RoutingService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(this.routingSvc.paramMap$);
  }

}
