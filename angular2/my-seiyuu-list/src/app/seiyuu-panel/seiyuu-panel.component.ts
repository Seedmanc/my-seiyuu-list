import { Component, OnInit, Input } from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {Namesake, Seiyuu} from "../_models/seiyuu.model";
import {AnimeService} from "../_services/anime.service";

@Component({
  selector: 'msl-seiyuu-panel',
  templateUrl: './seiyuu-panel.component.html',
  styleUrls: ['./seiyuu-panel.component.css']
})
export class SeiyuuPanelComponent implements OnInit {
  @Input() seiyuu: Seiyuu & Namesake;

  selected: number;

  constructor(private seiyuuSvc: SeiyuuService, private animeSvc: AnimeService) { }

  ngOnInit() {
    if (this.seiyuu.pending) {
      this.seiyuuSvc.updateRequest$.next(this.seiyuu._id);
    } else
      if (this.seiyuu.namesakes) {

      this.seiyuu.namesakes
        .filter(namesake => namesake.pending)
        .forEach(namesake => this.seiyuuSvc.updateRequest$.next(namesake._id));
    }

    this.animeSvc.selected$.subscribe(id => this.selected = id);
  }

  pick(id: number) {
    this.seiyuuSvc.picked$.next(id);
  }

  remove() {
      this.seiyuuSvc.removed$.next(this.seiyuu._id || this.seiyuu.name);
  }

  select() {
    if (!this.seiyuu.pending && !this.seiyuu.namesakes)
      this.animeSvc.selected$.next(this.seiyuu._id);
  }

}
