import { Component, OnInit } from '@angular/core';
import {SeiyuuService} from "../services/seiyuu.service";
import {SortableComponent} from "../sortable.component";
import {theSite} from "../../environments/const";

@Component({
  selector: 'msl-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent extends SortableComponent implements OnInit {
  visible: boolean;
  theSite = theSite;

  constructor(public seiyuuSvc: SeiyuuService) {
    super();
  }

  ngOnInit() {
  }

  close(event) {
    if (event.target === event.currentTarget)
      this.visible = false;
  }

}
