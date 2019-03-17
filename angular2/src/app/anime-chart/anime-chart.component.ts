import { Component, OnInit } from '@angular/core';

import {AnimeService} from "../_services/anime.service";
import {SeiyuuService} from "../_services/seiyuu.service";

@Component({
  selector: 'msl-anime-chart',
  templateUrl: './anime-chart.component.html',
  styleUrls: ['./anime-chart.component.css']
})
export class AnimeChartComponent implements OnInit {

  constructor(
    public seiyuuSvc: SeiyuuService,
    public animeSvc: AnimeService
  ) { }

  ngOnInit() {
  }

}
