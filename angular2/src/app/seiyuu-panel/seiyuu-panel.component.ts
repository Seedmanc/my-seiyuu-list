import { Component, OnInit, Input } from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {Seiyuu} from "../_models/seiyuu.model";

@Component({
  selector: 'msl-seiyuu-panel',
  templateUrl: './seiyuu-panel.component.html',
  styleUrls: ['./seiyuu-panel.component.css']
})
export class SeiyuuPanelComponent implements OnInit {
  @Input() seiyuu: Seiyuu;

  selected: number;

  constructor(private seiyuuSvc: SeiyuuService) { }

  ngOnInit() {
    [this.seiyuu]
      .concat(this.seiyuu.namesakes)
      .filter(seiyuu => seiyuu.pending)
      .forEach(seiyuu => this.seiyuuSvc.updateRequest$.next(seiyuu._id));

    this.seiyuuSvc.selected$.subscribe(id => this.selected = id);
  }

  pick(id: number) {
    this.seiyuuSvc.picked$.next(id);
  }

  remove() {
    if (this.seiyuu.hasNamesakes) {
      this.seiyuuSvc.removeByName(this.seiyuu.displayName);
    } else {
      this.seiyuuSvc.removeById(this.seiyuu._id);
    }
  }

  select() {
    if (!this.seiyuu.pending && !this.seiyuu.hasNamesakes)
      this.seiyuuSvc.selected$.next(this.seiyuu._id);
  }

}
