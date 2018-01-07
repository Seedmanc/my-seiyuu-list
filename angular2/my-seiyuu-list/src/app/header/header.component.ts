import { Component, OnInit } from '@angular/core';
import {RestService} from "../services/rest.service";
import {SeiyuuService} from "../services/seiyuu.service";
import {MessagesService} from "../services/messages.service";

@Component({
  selector: 'msl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  searchQuery: string = '';
  status$;

  constructor(public restSvc: RestService, public seiyuuSvc: SeiyuuService, private messageSvc: MessagesService) { }

  ngOnInit() {
    this.status$ = this.messageSvc.message$;
  }

  disable() {
    return false;
  }

  inputChange(input) {
  }

}
