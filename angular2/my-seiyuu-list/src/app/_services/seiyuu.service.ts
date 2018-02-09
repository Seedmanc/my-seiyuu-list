import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";

import {BasicSeiyuu, Namesake, Seiyuu} from "../_models/seiyuu.model";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {Utils} from "./utils.service";
import {RoutingService} from "./routing.service";
import {AnimeService} from "./anime.service";

@Injectable()
export class SeiyuuService {
  totalList$: Observable<BasicSeiyuu[]>;
  displayList$: Observable<(BasicSeiyuu|Namesake)[]>;

  updateRequest$: Subject<number> = new Subject();
  picked$: Subject<number> = new Subject();
  removed$: Subject<number|string> = new Subject();
  selected$: Subject<Seiyuu> = new Subject();

  pending: boolean = true;

  private routeId$: Observable<number[]>;
  private namesake$: Subject<Namesake[]> = new BehaviorSubject([]);
  private totalMap: {[key:number]: BasicSeiyuu} = {};


  constructor(private rest:RestService, private messageSvc: MessagesService,
              private routingSvc: RoutingService, private animeSvc:AnimeService) {

    this.totalList$ = this.getTotalList()
      .do(list => this.animeSvc.animeCount$
        .subscribe(number => this.messageSvc.status(list.length + ` seiyuu & ${number} anime records cached`))
      )
      .do(() => this.pending = false)
      .publishLast().refCount();

    this.routeId$ = this.routingSvc.routeId$
      .delayWhen(()=>this.totalList$)
      .map(ids => ids.filter(id => !!this.totalMap[id]));

    this.updateRequest$
      .bufferToggle(this.updateRequest$.throttleTime(200), ()=>Observable.timer(200))
      .flatMap(ids => this.loadByIds(ids))
      .subscribe(seiyuus => {
        seiyuus.forEach(seiyuu => {
          this.totalMap[seiyuu._id].upgrade(seiyuu);
        });
      });

    this.displayList$ = this.routeId$
      .map(ids => ids.map(id => this.totalMap[id]))
      .do(seiyuus => document.title = 'My Seiyuu List' +
        (seiyuus.length ? ' - ' + seiyuus.map(seiyuu => seiyuu.name).join(', ') : '')
      )
      .combineLatest(this.namesake$)
      .map(([seiyuus, namesakes]) => [...seiyuus, ...namesakes]);

    this.removed$.withLatestFrom(this.routeId$)
      .do(([removed,current]) => this.routingSvc.remove(removed, current))
      .map(([removed]) => removed)
      .withLatestFrom(this.namesake$)
      .map(([removed,current]) => current.filter(nmsk => nmsk.name !== removed))
      .do(filtered => this.namesake$.next(filtered))
      .subscribe();
  }

  addSearch(search$: Observable<string>) {
    let [found, notFound] = search$
      .withLatestFrom(this.totalList$)
      .map(([name,list]) => list
        .filter(seiyuu => !!Utils.unorderedEquals(name, seiyuu.name))
        .map(seiyuu => seiyuu._id))
      .partition(equals => !!equals.length);

    let [single, multiple] = found
      .withLatestFrom(this.displayList$
        .map(list => list.length))
      .filter(([,count]) => count < 4 || !!this.messageSvc.status('maximum of 4 people are allowed'))
      .do(_ => this.messageSvc.blank())
      .map(([list]) => list)
      .share()
      .partition(list => list.length === 1);

    multiple
      .map(ids => new Namesake(ids.map(id => this.totalMap[id])))
      .withLatestFrom(this.namesake$, (New, old) => Utils.unique([...old, New], 'name'))
      .subscribe(namesakes => this.namesake$.next(namesakes));

    single
      .map(ids => ids[0])
      .merge(this.picked$
        .do(id => this.removed$.next(this.totalMap[id].name)))
      .withLatestFrom(this.routeId$)
      .map(([id, ids]) => this.routingSvc.add(id, ids))
      .filter(id => !!id)
      .do(id => this.messageSvc.status(`"${this.totalMap[id].name}" is already selected`))
      .subscribe();

    notFound.withLatestFrom(search$)
      .subscribe(([,search]) => this.messageSvc.error(`"${search}" is not found`));
  }


  private loadByIds(ids: number[]): Observable<Seiyuu[]> {
    return this.rest.mongoCall({
      coll: 'seiyuu-test',
      mode: 'GET',
      query: {
        q: {
           _id: {'$in': ids}
        }
      }
    }).map(list => list.map(el => new Seiyuu(el)))
      .catch(err => {
        this.messageSvc.error('Error loading seiyuu details: '+err.status);

        console.warn(err.message, err.error && err.error.message);
        ids.forEach(id => this.removed$.next(id));

        return Observable.of([])
      })
  }

  private getTotalList(): Observable<BasicSeiyuu[]> {
    return this.rest.mongoCall({
      coll: 'seiyuu-test',
      mode: 'GET',
      query: {
        f: {name: 1, hits: 1, updated: 1, count: 1, accessed: 1},
        s: {name: 1}
      }
    }).map(list => list.map(el => new BasicSeiyuu(el)))
      .do(list => list.forEach(seiyuu => this.totalMap[seiyuu._id] = seiyuu))
      .catch(err => {
        this.messageSvc.error('Error getting cached list: '+err.status);

        console.warn(err.message, err.error && err.error.message);
        this.pending = false;

        throw err;
      })
  }

}
