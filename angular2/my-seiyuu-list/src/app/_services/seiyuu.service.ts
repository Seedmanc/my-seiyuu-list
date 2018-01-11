import { Injectable } from '@angular/core';
import {BasicSeiyuu, Seiyuu} from "../_models/seiyuu.model";
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {pluralize} from "../../environments/const";
import {Subject} from "rxjs/Subject";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class SeiyuuService {
  totalList$: Observable<BasicSeiyuu[]>;
  search$: Observable<string>;
  selectedList$: Subject<(Seiyuu|BasicSeiyuu)[]> = new Subject(); //todo wtf
  updateRequest$: Subject<number> = new Subject();

  pending: boolean = true;

  routeId$: Subject<number[]> = new BehaviorSubject([]);
  private selectedList = [];

  constructor(private rest:RestService, private messageSvc: MessagesService, private router: Router) {

    this.totalList$ = this.rest.mongoCall({
      coll: 'seiyuu',
      mode: 'get',
      query: {
        f: {name: 1, hits: 1, updated: 1, count: 1, accessed: 1},
        s: {name: 1}
      }
    }).map(list => list.map(el => new BasicSeiyuu(el)))
      .do(list => this.messageSvc.status(list.length + ` record${pluralize(list.length)} cached`))
      .do(_ => this.pending = false)
      .publishLast().refCount();

    this.updateRequest$.bufferTime(500)
      .filter(el=>!!el.length)      //otherwise endless loop wtf
      .flatMap(ids => this.loadByIds(ids))
      .withLatestFrom(this.totalList$)
      .subscribe(([seiyuus,total]) => {
        seiyuus.forEach(seiyuu => {
          let index = this.selectedList.findIndex(el => el._id === seiyuu._id);
          this.selectedList[index].upgrade(seiyuu);
          total.find(seiyuu2 => seiyuu2._id === seiyuu._id).upgrade(seiyuu);
        });
        this.selectedList$.next(this.selectedList);
      });

    this.routeId$.withLatestFrom(this.totalList$)
      .map(([ids, list]) => ids.map(id => list.find(el => el._id === id)))
      .do(seiyuus => {this.selectedList = seiyuus; this.selectedList$.next(this.selectedList)})
      .subscribe();
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
      .map(seiyuu => seiyuu._id)
      .withLatestFrom(this.routeId$)
      .do(([id, ids]) => {
        let newList = [...ids, id].filter((el, i, arr) => arr.indexOf(el) === i);
        this.router.navigate(['/'+newList.join(','), 'anime']);
      })
      .subscribe();

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

  public loadByIds(ids: number[]): Observable<Seiyuu[]> {
    return this.rest.mongoCall({
      coll: 'seiyuu',
      mode: 'get',
      query: {
        q: {
           _id: {'$in': ids}
        }
      }
    }).map(list => list.map(el => new Seiyuu(el)))
  }

}
