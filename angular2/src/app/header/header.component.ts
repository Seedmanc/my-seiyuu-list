import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {MessagesService} from "../_services/messages.service";
import {Observable} from "rxjs/Observable";
import {fromEvent} from "rxjs/observable/fromEvent";
import {Utils} from "../_services/utils.service";

@Component({
  selector: 'msl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('search') searchInput: ElementRef;
  searchQuery: string = '';
  hideTry: boolean;

  get displaySuggestion(): boolean {
    return this.seiyuuSvc.displayList$.getValue().length < 2;
  }

  name$: Observable<string[]>;


  constructor(public seiyuuSvc: SeiyuuService,
              public messageSvc: MessagesService) { }

  ngOnInit() {
    this.name$ = this.seiyuuSvc.totalList$.map(seiyuus => seiyuus.map(seiyuu => seiyuu.name));
    this.hideTry = !!localStorage.hideTry;

    const input = fromEvent(this.searchInput.nativeElement, 'input')
      .debounceTime(500)
      .withLatestFrom(this.seiyuuSvc.totalList$)
      .filter(([event, list]) => list.some(el => el.name.toLowerCase() === event['target'].value.toLowerCase()))
      .map(([event]) => event);

    fromEvent(this.searchInput.nativeElement, 'change')
      .merge(input)                                                                                        .do(Utils.asrt('input'))
      .map((event: Event) => event.target['value'] && event.target['value'].trim().toLowerCase())
      .filter(value => !!(value && value.length > 2))
      .merge(this.messageSvc.resetSearch$
        .do(() => this.searchInput.nativeElement.value = ''))
      .distinctUntilChanged()
      .do(() => this.selectAll())
      .subscribe(this.seiyuuSvc.search$);
  }

  selectAll() {
    setTimeout(() => this.searchInput.nativeElement.select());
  }

  isSelected(name: string): boolean {
    return this.seiyuuSvc.selectedSeiyuu.includes(name);
  }

  hide() {
    localStorage.hideTry = true;
    this.hideTry = true;
  }

}
