import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../../_services/routing.service";
import {ChildParamsComponent} from "../../child-params.component";
import {AnimeService} from "../../_services/anime.service";
import {SorterService} from "../../_services/sorter.service";

@Component({
  selector: 'msl-anime-list',
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css'],
  providers: [SorterService]
})
export class AnimeListComponent extends ChildParamsComponent implements OnInit {
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

  constructor(protected route: ActivatedRoute, protected routingSvc: RoutingService,
              public animeSvc: AnimeService,
              public sorter: SorterService) {
      super(route, routingSvc);
    }

  ngOnInit() {
    super.ngOnInit();

    this.animeSvc.mainOnly$.subscribe(value => this.mainOnly = value);

    this.animeSvc.displayAnime$
      .subscribe(animes => {
        this.output[0].list = animes.filter(a => a.main);
        this.output[1].list = animes.filter(a => !a.main);
      });
  }

  onMainOnlyChange(value) {
    this.animeSvc.mainOnly$.next(value);
  }

}
