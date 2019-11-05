import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";

import {RoutingService} from "../../_services/routing.service";
import {PageComponent} from "../page.component";
import {MagazineService} from "../../_services/magazine.service";
import {Utils} from "../../_services/utils.service";
import {MessagesService} from "../../_services/messages.service";
import {Magazine} from "../../_models/magazine.model";

@Component({
  selector: 'msl-magazine-list',
  templateUrl: './magazine-list.component.html',
  styleUrls: ['./magazine-list.component.css']
})
export class MagazineListComponent extends PageComponent implements OnInit {
  list: Magazine[];

  constructor(public magazineSvc: MagazineService,
              private messageSvc: MessagesService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.magazineSvc.displayMagazines$
      .takeUntil(this.unsubscribe$)
      .do(magazines =>
        this.messageSvc.results(
          magazines,
          magazines => {
            let iss = magazines.reduce((p, c) => p + c.issues.length, 0);
            return `${iss} issue${Utils.pluralize(iss)} in ${magazines.length} [magazine]`;
          }
        )
      )
      .subscribe(x => this.list = x);
  }

  isSelected(s: string): boolean {
    return this.magazineSvc.selectedSeiyuu.includes(s);
  }

}
