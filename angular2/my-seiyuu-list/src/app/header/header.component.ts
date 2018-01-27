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
  name$: Observable<string[]>;
  search$: Observable<string>;

  searchQuery: string = '';

  constructor(public seiyuuSvc: SeiyuuService, private messageSvc: MessagesService) { }

  ngOnInit() {
    this.status$ = this.messageSvc.message$;
    this.name$ = this.seiyuuSvc.totalList$.map(seiyuus => seiyuus.map(seiyuu => seiyuu.name));

    let input = Observable.fromEvent(this.searchInput.nativeElement, 'input')
      .debounceTime(500)
      .withLatestFrom(this.seiyuuSvc.totalList$)
      .filter(([event,list]) => list.some(el=>el.name === event['target'].value))
      .map(([event]) => event);

    this.search$ = Observable.fromEvent(this.searchInput.nativeElement, 'change')
      .merge(input)
      .map((event:Event) => event.target['value'])
      .filter(value => !!(value && value.trim().length > 2))
      .distinctUntilChanged()
      .do(_ => this.selectAll());

    this.seiyuuSvc.addSearch(this.search$);
  }

  selectAll() {
    this.searchInput.nativeElement.select();
  }

  disable() {
    return this.seiyuuSvc.pending;
  }

}
