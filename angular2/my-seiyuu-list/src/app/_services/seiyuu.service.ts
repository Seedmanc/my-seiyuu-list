import { Injectable } from '@angular/core';
import {BasicSeiyuu, Seiyuu} from "../_models/seiyuu.model";
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {pluralize} from "../../environments/const";
import {Subject} from "rxjs/Subject";

@Injectable()
export class SeiyuuService {
  totalList$: Observable<BasicSeiyuu[]>;
  search$: Observable<string>;
  selectedList$: Subject<Seiyuu[]> = new Subject();

  private selectedList: Seiyuu[] = [];

  constructor(private rest:RestService, private messageSvc: MessagesService) {

    this.totalList$ = this.rest.mongoCall({
      coll: 'seiyuu',
      mode: 'get',
      query: {
        f: {name: 1, hits: 1, updated: 1, count: 1, accessed: 1},
        s: {name: 1}
      }
    }).map(list => list.map(el => new BasicSeiyuu(el)))
      .do(list => this.messageSvc.status(list.length + ` record${pluralize(list.length)} cached`))
      .publishLast().refCount();
  }

  attachListener(search$: Observable<Event>) {
    this.search$ = search$.debounceTime(500)
      .map(event => event.target['value'])
      .filter(value => !!(value && value.trim().length > 3));   // u mad?

    let [found, notFound] = this.search$
      .combineLatest(this.totalList$)
      .map(([name,list]) => list.find(seiyuu => !!this.equals(name, seiyuu.name)))
      .partition(equals => !!equals);

    found.do(_=>this.messageSvc.blank())
      .do(console.info)
      .flatMap(basicSeiyuu => this.loadSeiyuu([basicSeiyuu._id]))
      .do(list => {
        this.selectedList.push(...list);
        this.selectedList$.next(this.selectedList);
      })
      .subscribe(console.log);

    notFound.withLatestFrom(this.search$)
      .subscribe(input => this.messageSvc.error(`"${input[1]}" is not found`));
  }

  private equals(input: string, name: string): string {
    if (name) {
      input = input.toLowerCase();
      name = name.toLowerCase();

      return (input === name || input.split(' ').reverse().join(' ') === name) && name;
    } else return '';
  }

  private loadSeiyuu(ids: number[]): Observable<Seiyuu[]> {
    return this.rest.mongoCall({
      coll: 'seiyuu',
      mode: 'get',
      query: {
        q: {
           _id: {'$in': ids}
        }
      }
    }).map(list => list.map(el => new Seiyuu(el)));
  }

}
