import { Component, ViewChild} from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {SorterService} from "../_services/sorter.service";

@Component({
  selector: 'msl-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css'],
  providers: [SorterService]
})
export class RankingComponent {
  @ViewChild('rankingTable') rankingTable;

  visible: boolean;
  hasScroll: boolean;

  constructor(public seiyuuSvc: SeiyuuService, public sorter: SorterService) {  }

  open() {
    this.visible = true;
    setTimeout(() => {
      let el = this.rankingTable.nativeElement.parentNode;
      this.hasScroll = el.clientHeight < el.scrollHeight;
    });
  }

  close(event) {
    if (event.target === event.currentTarget)
      this.visible = false;
  }

}
