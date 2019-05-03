import { Component, OnInit } from '@angular/core';

import {AnimeService} from "../_services/anime.service";
import {SeiyuuService} from "../_services/seiyuu.service";
import {MessagesService} from "../_services/messages.service";
import {Utils} from "../_services/utils.service";

@Component({
  selector: 'msl-anime-chart',
  templateUrl: './anime-chart.component.html',
  styleUrls: ['./anime-chart.component.css']
})
export class AnimeChartComponent implements OnInit {

  constructor(
    public seiyuuSvc: SeiyuuService,
    public animeSvc: AnimeService,
    private messageSvc: MessagesService
  ) { }

  ngOnInit() {
    this.animeSvc.displayChart$
      .subscribe(chart => {
        let total = Utils.flattenDeep(chart);

        if (total.length) {
          this.messageSvc.blank();
        } else
          this.messageSvc.status('no shared anime found');
      });
  }

}
