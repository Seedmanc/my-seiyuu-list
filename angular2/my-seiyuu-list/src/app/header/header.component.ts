import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

  constructor(public seiyuuSvc: SeiyuuService, private messageSvc: MessagesService) { }

  ngOnInit() {
    this.status$ = this.messageSvc.message$;

    let search = Observable.fromEvent(this.searchInput.nativeElement, 'input')
      .debounceTime(500)
      .map((event:Event) => event.target['value'])
      .filter(value => !!(value && value.trim().length > 3));

    this.seiyuuSvc.addSearch(search);
  }

  disable() {
    return this.seiyuuSvc.pending;
  }

}
