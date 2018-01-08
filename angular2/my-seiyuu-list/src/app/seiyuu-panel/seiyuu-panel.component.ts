import { Component, OnInit, Input } from '@angular/core';
import {Seiyuu} from "../_models/seiyuu.model";

@Component({
  selector: 'msl-seiyuu-panel',
  templateUrl: './seiyuu-panel.component.html',
  styleUrls: ['./seiyuu-panel.component.css']
})
export class SeiyuuPanelComponent implements OnInit {

  @Input() seiyuu: Seiyuu;
  theSite: string = 'myanimelist.net';

  constructor() { }

  ngOnInit() {
  }

  select = ()=>{}

}
