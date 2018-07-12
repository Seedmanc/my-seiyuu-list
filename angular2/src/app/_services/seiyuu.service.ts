import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";

import {BasicSeiyuu,  Seiyuu} from "../_models/seiyuu.model";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {Utils} from "./utils.service";
import {RoutingService} from "./routing.service";

@Injectable()
export class SeiyuuService {
  totalList$: Observable<BasicSeiyuu[]>;
  displayList$: Observable<BasicSeiyuu[]>;

  updateRequest$: Subject<number> = new Subject();
  picked$: Subject<number> = new Subject();
  loadedSeiyuu$: BehaviorSubject<Seiyuu[]> = new BehaviorSubject(null);
  seiyuuCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  selected$: BehaviorSubject<number> = new BehaviorSubject(null);
  displaySeiyuu$: BehaviorSubject<Seiyuu[]> = new BehaviorSubject(null);

  pending: boolean = true;

  private routeId$: Observable<number[]>;
  private namesake$: BehaviorSubject<BasicSeiyuu[]> = new BehaviorSubject([]);
  private totalMap: {[key: number]: BasicSeiyuu} = {};
/*private*/ loaded$: Subject<Seiyuu[]> = new Subject();


  constructor(private rest: RestService,
              private messageSvc: MessagesService,
              private routingSvc: RoutingService) {

    this.loaded$                                                                                            .do(Utils.log('loaded'))
      .do(seiyuus => {
        if (seiyuus.length)
          this.selected$.next(seiyuus[seiyuus.length-1]._id);
      })
      .subscribe(this.loadedSeiyuu$);

    this.totalList$ = this.getTotalList()                                                                  .do(Utils.lg('totalList'))
      .do(list => {
        this.seiyuuCount$.next(list.length);
        this.pending = false;
      })
      .publishLast().refCount();

    this.routeId$ = this.routingSvc.routeId$
      .delayWhen(() => this.totalList$)                                                                    .do(Utils.log('routeId'))
      .map(ids => ids.filter(id => !!this.totalMap[id]));

    this.updateRequest$                                                                                    .do(Utils.lg('updateRequest'))
      .bufferToggle(this.updateRequest$.throttleTime(200), () => Observable.timer(200))
      .flatMap(ids => this.loadByIds(ids))
      .withLatestFrom(this.routeId$)
      .do(([seiyuus, ids]) => {
        seiyuus.forEach(seiyuu => {
          this.totalMap[seiyuu._id].upgrade(seiyuu);
        });
        let ready = ids.map(id => this.totalMap[id]).filter(s => !s.pending);
        if (seiyuus.length && ~ids.indexOf(seiyuus[0]._id) && ready.length) {
          this.loaded$.next(ready);
        }
      }).subscribe();

    this.displayList$ = this.routeId$                                                                      .do(Utils.lg('displayList'))
      .map(ids => ids.map(id => this.totalMap[id]))
      .do(seiyuus => document.title = 'My Seiyuu List' +
        (seiyuus.length ? ' - ' + seiyuus.map(seiyuu => seiyuu.name).join(', ') : '')
       )
      .do(seiyuus => {
        if (seiyuus.every(seiyuu => !seiyuu.pending)) {
          this.loaded$.next(seiyuus);
        }
      })
      .do(seiyuus => this.displaySeiyuu$.next(seiyuus))
      .combineLatest(this.namesake$)
      .map(([seiyuus, namesakes]) => [...seiyuus, ...namesakes]);
  }

  removeById(id: number) {
    this.routingSvc.remove(id);
    this.messageSvc.resetSearch$.next();
  }

  removeByName(name: string) {
    this.namesake$.next(this.namesake$.getValue().filter(nmsk => nmsk.displayName !== name));
  }

  addSearch(search$: Observable<string>) {
    const [found$, notFound$] = search$                                                                    .do(Utils.lg('search'))
      .filter(value => !!value)
      .withLatestFrom(this.totalList$)
      .map(([name, list]) => list
        .filter(seiyuu =>
          !!Utils.unorderedCompare(name, seiyuu.name) || Utils.kanjiCompare(name, seiyuu.alternate_name)
        )
        .map(seiyuu => seiyuu._id))
      .partition(equals => !!equals.length);

    const [single$, multiple$] = found$                                                                    .do(Utils.lg('found'))
      .withLatestFrom(this.displayList$
        .map(list => list.length))
      .filter(([,count]) => count < 4 || !!this.messageSvc.status('maximum of 4 people are allowed'))
      .map(([list]) => list)
      .share()
      .partition(list => list.length === 1);

    multiple$                                                                                              .do(Utils.lg('multiple'))
      .map(ids => new BasicSeiyuu({namesakes: ids.map(id => this.totalMap[id])}))
      .withLatestFrom(this.namesake$, (New, old) => Utils.unique([...old, New], 'displayName'))
      .subscribe(namesakes => this.namesake$.next(namesakes));

    single$                                                                                                .do(Utils.lg('single'))
      .map(ids => ids[0])
      .merge(this.picked$
        .do(id => this.removeByName(this.totalMap[id].name)))
      .withLatestFrom(this.routeId$)
      .map(([id, ids]) => this.routingSvc.add(id, ids))
      .filter(id => !!id)
      .do(id => this.messageSvc.status(`"${this.totalMap[id].name}" is already selected`))
      .subscribe();

    notFound$                                                                                              .do(Utils.lg('notFound'))
      .withLatestFrom(search$)
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
        ids.forEach(id => this.removeById(id));

        return Observable.of([]);
      });
  }

  private getTotalList(): Observable<BasicSeiyuu[]> {
    return this.rest.mongoCall({
      coll: 'seiyuu-test',
      mode: 'GET',
      query: {
        f: {name: 1, hits: 1, updated: 1, count: 1, accessed: 1, alternate_name: 1},
        s: {name: 1}
      }
    }).map(list => list.map(el => new BasicSeiyuu(el)))
      .do(list => list.forEach(seiyuu => this.totalMap[seiyuu._id] = seiyuu))
      .catch(err => {
        this.messageSvc.error('Error getting cached list: '+err.status);

        console.warn(err.message, err.error && err.error.message);
        this.pending = false;

        throw err;
      });
  }

}
