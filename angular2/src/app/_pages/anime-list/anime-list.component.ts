import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";

import {RoutingService} from "../../_services/routing.service";
import {PageComponent} from "../page.component";
import {AnimeService} from "../../_services/anime.service";
import {SorterService} from "../../_services/sorter.service";
import {MessagesService} from "../../_services/messages.service";
import {SeiyuuService} from "../../_services/seiyuu.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  selector: 'msl-anime-list',
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css'],
  providers: [SorterService]
})
export class AnimeListComponent extends PageComponent implements OnInit {
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
  tierGrouping$ = new BehaviorSubject(true);

  constructor(public animeSvc: AnimeService,
              public sorter: SorterService,
              public seiyuuSvc: SeiyuuService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService,
              private messageSvc: MessagesService) {
      super(route, routingSvc);
    }

  ngOnInit() {
    super.ngOnInit();

    this.animeSvc.mainOnly$.subscribe(value => this.mainOnly = value);

    this.animeSvc.displayAnime$
      .takeUntil(this.unsubscribe$)
      .do(anime => {
        if (this.animeSvc.toggleChart$.getValue()) return;

        let entity = this.seiyuuSvc.loadedSeiyuu$.getValue().length > 1 ?
          'shared anime' :
          'anime';

        this.messageSvc.results(
          anime,
          animes => `${animes.length} ${entity}`
        );
      })
      .combineLatest(this.tierGrouping$)
      .subscribe(([anime, group]) => {
        anime = anime || [];

        if (group) {
          this.output.find(o => o.type == 'main').list = anime.filter(a => a.main);
          this.output.find(o => o.type != 'main').list = anime.filter(a => !a.main);
        } else {
          this.output.find(o => o.type == 'main').list = anime;
          this.output.find(o => o.type != 'main').list = [];
        }
      });

    if (localStorage.mainOnly) {
      this.mainOnly = localStorage.mainOnly == 'true';
      this.onMainOnlyChange(this.mainOnly);
    }
  }

  onMainOnlyChange(value) {
    localStorage.mainOnly = value;
    this.animeSvc.mainOnly$.next(value);
  }

  toggleTierGrouping() {
    if (this.tierGrouping$.getValue())
      this.tierOrder = !this.tierOrder;
    if (this.tierOrder)
      this.tierGrouping$.next(!this.tierGrouping$.getValue());
  }

}
