import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../../_services/routing.service";

import {PageComponent} from "../../_misc/page.component";
import {MagazineService} from "../../_services/magazine.service";

@Component({
  selector: 'msl-magazine-list',
  templateUrl: './magazine-list.component.html',
  styleUrls: ['./magazine-list.component.css']
})
export class MagazineListComponent extends PageComponent implements OnInit {
  list: any[];

  constructor(public magazineSvc: MagazineService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.magazineSvc.display$
      .takeUntil(this.unsubscribe$)
      .subscribe(x => this.list = x);
  }

  isSelected(s: string): boolean {
    return this.magazineSvc.selectedSeiyuu.includes(s);
  }

}
