import { Component, OnInit } from '@angular/core';
import {SeiyuuService} from "../services/seiyuu.service";

@Component({
  selector: 'msl-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  visible: boolean;

  ascending: boolean;
  orderByField: string = 'name';

  constructor(public seiyuuSvc: SeiyuuService) { }

  ngOnInit() {
  }

  close(event) {
    if (event.target === event.currentTarget)
      this.visible = false;
  }

  sort(field) {
    this.ascending = !this.ascending;
    this.orderByField = field;
  }

}
