import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";

import {RoutingService} from "../../_services/routing.service";
import {PageComponent} from "../../_misc/page.component";
import {MagazineService} from "../../_services/magazine.service";
import {Utils} from "../../_services/utils.service";
import {MessagesService} from "../../_services/messages.service";
import {Magazine} from "../../_models/magazine.model";
import {SeiyuuService} from "../../_services/seiyuu.service";

@Component({
  selector: 'msl-magazine-list',
  templateUrl: './magazine-list.component.html',
  styleUrls: ['./magazine-list.component.css']
})
export class MagazineListComponent extends PageComponent implements OnInit {
  list: Magazine[];

  constructor(public magazineSvc: MagazineService,
              private messageSvc: MessagesService,
              private seiyuuSvc: SeiyuuService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.magazineSvc.displayMagazines$
      .takeUntil(this.unsubscribe$)
      .do(magazines => {
        let iss = magazines.reduce((p, c) => p + c.issues.length, 0);

        this.messageSvc.results(
          magazines.length && `${iss} issue${Utils.pluralize(iss)} in ${magazines.length} magazine${Utils.pluralize(magazines.length)}`,
          this.seiyuuSvc.displayList$.getValue().length,
          'magazines'
        );
      })
      .subscribe(x => this.list = x);
  }

  isSelected(s: string): boolean {
    return this.magazineSvc.selectedSeiyuu.includes(s);
  }

}
