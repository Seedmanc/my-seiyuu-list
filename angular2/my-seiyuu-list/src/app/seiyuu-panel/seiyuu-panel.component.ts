import { Component, OnInit, Input } from '@angular/core';
import {Seiyuu} from "../_models/seiyuu.model";
import {theSite} from "../../environments/const";
import {SeiyuuService} from "../_services/seiyuu.service";

@Component({
  selector: 'msl-seiyuu-panel',
  templateUrl: './seiyuu-panel.component.html',
  styleUrls: ['./seiyuu-panel.component.css']
})
export class SeiyuuPanelComponent implements OnInit {

  @Input() seiyuu: Seiyuu;
  theSite: string = theSite;

  constructor(private seiyuuSvc: SeiyuuService) { }

  ngOnInit() {
    if (this.seiyuu.pending) {
      this.seiyuuSvc.updateRequest$.next(this.seiyuu._id);
    }
    if (this.seiyuu.namesakes) {
      this.seiyuu.namesakes.forEach(namesake => this.seiyuuSvc.updateRequest$.next(namesake._id));
    }
  }

  pick(id: number) {
    this.seiyuuSvc.picked$.next(id);
  }

  select = ()=>{}

}
