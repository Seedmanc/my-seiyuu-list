import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";

import {RoutingService} from "../../_services/routing.service";
import {PageComponent} from "../../_misc/page.component";
import {MagazineService} from "../../_services/magazine.service";
import {Utils} from "../../_services/utils.service";
import {MessagesService} from "../../_services/messages.service";

@Component({
  selector: 'msl-magazine-list',
  templateUrl: './magazine-list.component.html',
  styleUrls: ['./magazine-list.component.css']
})
export class MagazineListComponent extends PageComponent implements OnInit {
  list: any[];

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
      .do(([magazines, seiyuuCount]) => {
        let iss = magazines.reduce((p, c) => p + c.issues.length, 0);

        this.messageSvc.results(
          magazines.length && `${iss} issue${Utils.pluralize(iss)} in ${magazines.length} magazine${Utils.pluralize(magazines.length)}`,
          seiyuuCount,
          'magazines'
        );
      })
      .subscribe(([x]) => this.list = x);
  }

  isSelected(s: string): boolean {
    return this.magazineSvc.selectedSeiyuu.includes(s);
  }

}
