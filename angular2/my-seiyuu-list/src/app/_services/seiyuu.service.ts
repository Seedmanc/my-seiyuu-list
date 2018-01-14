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

  pending: boolean = true;

  private routeId$: Subject<number[]> = new BehaviorSubject([]);
  private namesake$: Subject<BasicSeiyuu[]> = new BehaviorSubject([]);
  private totalMap: {[key:number]: BasicSeiyuu} = {};


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
      .do(list => list.forEach(seiyuu => this.totalMap[seiyuu._id] = seiyuu))
      .do(_ => this.pending = false)
      .publishLast().refCount();

    this.updateRequest$.bufferTime(500)
      .filter(el=>!!el.length)      //otherwise endless loop wtf
      .flatMap(ids => this.loadByIds(ids))
      .subscribe(seiyuus => {
        seiyuus.forEach(seiyuu => {
          this.totalMap[seiyuu._id].upgrade(seiyuu);
        });
      });

    this.displayList$ = this.routeId$
      .map(ids => ids.map(id => this.totalMap[id]))
      .combineLatest(this.namesake$)
      .map(([seiyuus, namesakes]) => [...seiyuus, ...namesakes]);
  }

  addSearch(search$: Observable<string>) {
    let [found, notFound] = search$
      .withLatestFrom(this.totalList$)
      .map(([name,list]) => list.filter(seiyuu => !!this.equals(name, seiyuu.name)).map(seiyuu => seiyuu._id))
      .partition(equals => !!equals.length);

    let [single, multiple] = found.do(_=>this.messageSvc.blank()).partition(list => list.length === 1);

    multiple.map(ids => [{namesakes: ids.map(id => this.totalMap[id])}])
      .withLatestFrom(this.namesake$, (New, old) => [...old, ...New])
      .subscribe(namesakes => this.namesake$.next(<BasicSeiyuu[]>namesakes));

    single
      .map(ids => ids[0])
      .merge(this.picked$.withLatestFrom(this.namesake$)
        .do(([picked,list]) => this.namesake$.next(list.filter(el => !el.namesakes.find(nmsk => nmsk._id === picked))))
        .map(([picked]) => picked)
      )
      .withLatestFrom(this.routeId$)
      .do(([id, ids]) => {
        let newList = [...ids, id].filter((el, i, arr) => arr.indexOf(el) === i);
        this.router.navigate(['/'+newList.join(','), 'anime']);
      })
      .subscribe();

    notFound.withLatestFrom(search$)
      .subscribe(input => this.messageSvc.error(`"${input[1]}" is not found`));
  }

  addRoutes(routeId$: Observable<number[]>) {
    routeId$
      .combineLatest(this.totalList$)
      .map(([ids,list]) => ids.filter(id => !!list.find(seiyuu => seiyuu._id === id)))
      .filter(ids => !!ids.length)
      .subscribe(ids => this.routeId$.next(ids));
  }

  private equals(input: string, name: string): string {
    if (name) {
      input = input.toLowerCase();
      name = name.toLowerCase();

      return (input === name || input.split(' ').reverse().join(' ') === name) && name;
    } else return '';
  }

  private loadByIds(ids: number[]): Observable<Seiyuu[]> {
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
