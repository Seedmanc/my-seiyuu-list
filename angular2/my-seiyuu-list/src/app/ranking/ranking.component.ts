import { Component, ViewChild} from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {SortableComponent} from "../sortable.component";

@Component({
  selector: 'msl-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent extends SortableComponent {
  @ViewChild('rankingTable') rankingTable;

  visible: boolean;
  hasScroll: boolean;

  constructor(public seiyuuSvc: SeiyuuService) {
    super();
  }

  open() {
    this.visible = true;
    setTimeout(()=>{
      let el = this.rankingTable.nativeElement.parentNode;
      this.hasScroll = el.clientHeight < el.scrollHeight;
    })
  }

  close(event) {
    if (event.target === event.currentTarget)
      this.visible = false;
  }

}
