import { Component, ViewChild} from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {SorterService} from "../_services/sorter.service";
import {BasicSeiyuu} from "../_models/seiyuu.model";

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
  rankingList: BasicSeiyuu[];
  pending = {is: false};

  constructor(public sorter: SorterService, private seiyuuSvc: SeiyuuService) {  }

  open() {
    this.visible = true;

    setTimeout(() => {
      let el = this.rankingTable.nativeElement.parentNode;
      this.hasScroll = el.clientHeight < el.scrollHeight;
    });

    this.seiyuuSvc.getRanking(this.pending)
      .subscribe(list => this.rankingList = list);
  }

  close(event) {
    if (event.target === event.currentTarget)
      this.visible = false;
  }

}
