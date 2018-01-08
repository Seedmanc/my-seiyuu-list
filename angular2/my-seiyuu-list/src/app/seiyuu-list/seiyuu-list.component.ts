import { Component, OnInit } from '@angular/core';
import {Seiyuu} from "../_models/seiyuu.model";

@Component({
  selector: 'msl-seiyuu-list',
  templateUrl: './seiyuu-list.component.html',
  styleUrls: ['./seiyuu-list.component.css']
})
export class SeiyuuListComponent implements OnInit {

  seiOut: Seiyuu[] = [
    new Seiyuu(
      7337,
      'Misawa Sachika',
      '/images/voiceactors/2/44621.jpg',
      24,
      1,
      true,true
    ),
    new Seiyuu(
      14,
      'Hayashibara Megumi',
      '/images/voiceactors/1/40734.jpg',
      297,
      2,
    ),
  ];

  constructor() { }

  ngOnInit() {
  }

}
