import { Injectable } from '@angular/core';
import {BasicSeiyuu} from "../models/seiyuu.model";
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {pluralize} from "../../environments/const";

@Injectable()
export class SeiyuuService {
  basicList$: Observable<BasicSeiyuu[]>;
  search$: Observable<string>;

  constructor(private rest:RestService, private messageSvc: MessagesService) {

    this.basicList$ = this.rest.mongoCall({
      coll: 'seiyuu',
      mode: 'get',
      query: {
        f: {name: 1, hits: 1, updated: 1, count: 1, accessed: 1},
        s: {name: 1}
      }
    }).map(list => list.map(seiyuu => {
      return {...seiyuu,
        updated: new Date(seiyuu.updated),
        accessed: seiyuu.accessed && new Date(seiyuu.accessed) || new Date(seiyuu.updated)
      }
    }))
      .do(list => this.messageSvc.status(list.length + ` record${pluralize(list.length)} cached`))
      .share();
  }

  attachListener(search$: Observable<Event>) {
    this.search$ = search$.debounceTime(500)
      .map(event => event.target['value']);   // u mad?

    let [found, notFound] = this.search$
      .filter(value => !!(value && value.trim().length > 3))
      .combineLatest(this.basicList$)
      .map(([name,list]) => list.find(seiyuu => !!this.equals(name, seiyuu.name)))
      .partition(equals => !!equals);

    found.do(_=>this.messageSvc.blank()).subscribe(console.info);
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

}
