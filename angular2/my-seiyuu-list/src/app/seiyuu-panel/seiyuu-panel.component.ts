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
      this.seiyuuSvc.loadByIds([this.seiyuu._id]).subscribe();
    }
  }

  select = ()=>{}

}
