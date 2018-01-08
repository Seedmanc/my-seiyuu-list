import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RestService} from "../_services/rest.service";
import {SeiyuuService} from "../_services/seiyuu.service";
import {MessagesService} from "../_services/messages.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'msl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @ViewChild('search') searchInput: ElementRef;
  status$;
  searchQuery: string = '';

  constructor(public restSvc: RestService, public seiyuuSvc: SeiyuuService, private messageSvc: MessagesService) { }

  ngOnInit() {
    this.status$ = this.messageSvc.message$;

    this.seiyuuSvc.attachListener(Observable.fromEvent(this.searchInput.nativeElement, 'input'));
  }

  disable() {
    return this.restSvc.pending;
  }

  inputChange(input) {
  }

}
