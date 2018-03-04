import { Component, OnInit } from '@angular/core';
import {SortableComponent} from "../sortable.component";

import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../_services/routing.service";
import {ChildParamsComponent} from "../child-params.component";
import {AnimeService} from "../_services/anime.service";

@Component({
  selector: 'msl-anime-list',
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css']
})
export class AnimeListComponent extends SortableComponent implements OnInit {
  mixin: ChildParamsComponent;

  constructor(private route: ActivatedRoute, private routingSvc: RoutingService,
              public animeSvc: AnimeService) {
      super('_id');
      this.mixin = new ChildParamsComponent(route, routingSvc);
    }

  ngOnInit() {
    this.mixin.ngOnInit();
  }

  onMainOnlyChange(x?){}

}
