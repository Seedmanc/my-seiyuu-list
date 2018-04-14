import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {MessagesService} from "../_services/messages.service";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Utils} from "../_services/utils.service";
import {AnimeService} from "../_services/anime.service";
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/combineLatest';

@Component({
  selector: 'msl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @ViewChild('search') searchInput: ElementRef;
  status$;
  name$: Observable<string[]>;
  search$: Subject<string> = new Subject();

  searchQuery: string = '';

  constructor(public seiyuuSvc: SeiyuuService, private messageSvc: MessagesService, private animeSvc: AnimeService) { }

  ngOnInit() {
    this.status$ = this.messageSvc.message$;
    this.name$ = this.seiyuuSvc.totalList$.map(seiyuus => seiyuus.map(seiyuu => seiyuu.name));

    const input = Observable.fromEvent(this.searchInput.nativeElement, 'input')
      .debounceTime(500)
      .withLatestFrom(this.seiyuuSvc.totalList$)
      .filter(([event,list]) => list.some(el => el.name.toLowerCase() === event['target'].value.toLowerCase()))
      .map(([event]) => event);

    Observable.fromEvent(this.searchInput.nativeElement, 'change')
      .merge(input)                                                                                        .do(Utils.lg('input'))
      .map((event: Event) => event.target['value'] && event.target['value'].trim().toLowerCase())
      .filter(value => !!(value && value.length > 2))
      .distinctUntilChanged()
      .do(() => this.selectAll())
      .subscribe(this.search$);

    this.seiyuuSvc.addSearch(this.search$);
  }

  selectAll() {
    this.searchInput.nativeElement.select();
  }

}
