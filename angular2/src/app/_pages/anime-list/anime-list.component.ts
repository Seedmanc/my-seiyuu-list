import { Component, OnInit } from '@angular/core';
import {SortableComponent} from "../../sortable.component";
import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../../_services/routing.service";
import {ChildParamsComponent} from "../../child-params.component";
import {AnimeService} from "../../_services/anime.service";

@Component({
  selector: 'msl-anime-list',
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css']
})
export class AnimeListComponent extends SortableComponent implements OnInit {
  mixin: ChildParamsComponent;
  output = [
    {
      type: 'main',
      list: []
    },
    {
      type: 'supporting',
      list: []
    },
  ];
  tierOrder: boolean = true;
  mainOnly: boolean = false;

  constructor(private route: ActivatedRoute, private routingSvc: RoutingService,
              public animeSvc: AnimeService) {
      super('_id');
      this.mixin = new ChildParamsComponent(route, routingSvc);
    }

  ngOnInit() {
    this.mixin.ngOnInit();

    this.animeSvc.mainOnly$.subscribe(value => this.mainOnly = value);

    this.animeSvc.displayAnime$
      .subscribe(animes => {
        this.output[0].list = animes.filter(a => a.main);
        this.output[1].list = animes.filter(a => !a.main);
      });
  }

  onMainOnlyChange(value){
    this.animeSvc.mainOnly$.next(value);
  }

}
