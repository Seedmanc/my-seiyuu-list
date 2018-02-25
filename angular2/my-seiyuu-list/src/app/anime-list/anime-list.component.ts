import { Component, OnInit } from '@angular/core';
import {SortableComponent} from "../sortable.component";
import {Utils} from "../_services/utils.service";

import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../_services/routing.service";
import {ChildParamsComponent} from "../child-params.component";

@Component({
  selector: 'msl-anime-list',
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css']
})
export class AnimeListComponent extends SortableComponent implements OnInit {
  theSite = Utils.theSite;
  mixin: ChildParamsComponent;

  commonRoles: any[] = [
    {
      _id: 0,
      pic: '/images/anime/7/6797v.jpg',
      title: 'kemofure',
      character: 'serval',
      main: true
    },
    {
      _id: 1,
      pic: '/images/anime/7/6797v.jpg',
      title: 'kemofure',
      character: 'serval',
      main: false
    },
    {
      _id: 2,
      pic: '/images/anime/7/6797v.jpg',
      title: 'kemofure',
      character: 'kaban',
      main: false
    },
    {
      _id: 3,
      pic: '/images/anime/7/6797v.jpg',
      title: 'idolmaster',
      character: 'kaban',
      main: false
    },
  ]

  constructor(private route: ActivatedRoute, private routingSvc: RoutingService) {
      super('title');
      this.mixin = new ChildParamsComponent(route, routingSvc);
    }

  ngOnInit() {
    this.mixin.ngOnInit();
  }

}
