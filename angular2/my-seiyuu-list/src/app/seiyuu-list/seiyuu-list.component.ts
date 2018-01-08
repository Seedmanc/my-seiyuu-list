import { Component, OnInit } from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";

@Component({
  selector: 'msl-seiyuu-list',
  templateUrl: './seiyuu-list.component.html',
  styleUrls: ['./seiyuu-list.component.css']
})
export class SeiyuuListComponent implements OnInit {

  constructor(public seiyuuSvc: SeiyuuService) { }

  ngOnInit() {
  }

}
