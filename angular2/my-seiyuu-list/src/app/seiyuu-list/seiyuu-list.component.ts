import { Component, OnInit } from '@angular/core';
import {Seiyuu} from "../models/seiyuu.model";

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
    )
  ];

  constructor() { }

  ngOnInit() {
  }

}
