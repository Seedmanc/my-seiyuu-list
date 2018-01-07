import { Component, OnInit } from '@angular/core';
import {RestService} from "../services/rest.service";
import {SeiyuuService} from "../services/seiyuu.service";

@Component({
  selector: 'msl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  searchQuery: string = '';
  status: string = 'status';

  constructor(public restSvc: RestService, public seiyuuSvc: SeiyuuService) { }

  ngOnInit() {
  }

  disable() {
    return false;
  }

  inputChange(input) {
  }

}
