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
  updateRequest$: Subject<number> = new Subject();
  displayList$: Observable<BasicSeiyuu[]>;
  picked$: Subject<number> = new Subject();
  routeId$: Subject<number[]> = new BehaviorSubject([]);

  private search$: Observable<string>;
  private namesake$: Observable<BasicSeiyuu[]>;

  pending: boolean = true;


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
          total.find(seiyuu2 => seiyuu2._id === seiyuu._id).upgrade(seiyuu);
        });
      });
  }

  attachListener(search$: Observable<Event>) {
    this.search$ = search$.debounceTime(500)
      .map(event => event.target['value'])
      .filter(value => !!(value && value.trim().length > 3));   // u mad?

    let [found, notFound] = this.search$
      .withLatestFrom(this.totalList$)
      .map(([name,list]) => list.filter(seiyuu => !!this.equals(name, seiyuu.name)).map(seiyuu => seiyuu._id))
      .partition(equals => !!equals.length);

    let [single, multiple] = found.do(_=>this.messageSvc.blank()).partition(list => list.length === 1);

    this.namesake$ = multiple.map(ids => [new BasicSeiyuu({namesakes: ids})]).startWith([new BasicSeiyuu({namesakes:[1,2]})]);

    single
      .map(ids => ids[0])
     // .merge(this.picked$)
      .withLatestFrom(this.routeId$)
      .do(([id, ids]) => {
        let newList = [...ids, id].filter((el, i, arr) => arr.indexOf(el) === i);
        this.router.navigate(['/'+newList.join(','), 'anime']);
      })
      .subscribe();

    notFound.withLatestFrom(this.search$)
      .subscribe(input => this.messageSvc.error(`"${input[1]}" is not found`));

    this.displayList$ = this.routeId$.combineLatest(this.totalList$)
      .map(([ids, seiyuus]) => seiyuus.filter(el => ~ids.indexOf(el._id)))
      .combineLatest(this.namesake$).map(([seiyuus, namesakes]) => [...seiyuus, ...namesakes]);
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
