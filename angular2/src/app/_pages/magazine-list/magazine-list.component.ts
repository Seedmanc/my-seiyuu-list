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

  constructor(protected route: ActivatedRoute, protected routingSvc: RoutingService, private magazineSvc: MagazineService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    this.magazineSvc.display$
      .subscribe(x => {
        console.warn(x);
      });
  }

}
