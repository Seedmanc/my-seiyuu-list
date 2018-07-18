import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../../_services/routing.service";
import {PageComponent} from "../../_misc/page.component";
import {MagazineService} from "../../_services/magazine.service";
import {SeiyuuService} from "../../_services/seiyuu.service";

@Component({
  selector: 'msl-magazine-list',
  templateUrl: './magazine-list.component.html',
  styleUrls: ['./magazine-list.component.css']
})
export class MagazineListComponent extends PageComponent implements OnInit {
  selected: string[] = [];

  constructor(public magazineSvc: MagazineService,
              private seiyuuSvc: SeiyuuService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.seiyuuSvc.loadedSeiyuu$
      .map(seiyuus => seiyuus.map(s => s.displayName))
      .subscribe(names => this.selected = names);
  }

  isSelected(s: string): boolean {
    return this.selected.includes(s);
  }

}
