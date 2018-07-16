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
  loadedSeiyuu$: BehaviorSubject<Seiyuu[]> = new BehaviorSubject([]);
  selected$: BehaviorSubject<number> = new BehaviorSubject(null);

  pending: boolean = true;

  private rankingLoaded = false;
  private routeId$: Observable<number[]>;
  private picked$: Subject<number> = new Subject();
  private updateRequest$: Subject<number> = new Subject();
  private namesake$: BehaviorSubject<BasicSeiyuu[]> = new BehaviorSubject([]);
  private cachedSeiyuu: {[key: number]: BasicSeiyuu} = {};


  constructor(private rest: RestService,
              private messageSvc: MessagesService,
              private routingSvc: RoutingService) {

    // load the brief list of all seiyuu in DB, minus the roles and photos
    this.totalList$ = this.getTotalList()                                                                  .do(Utils.lg('Seiyuu list requested', 'warn'))
      .do(() => this.pending = false)
      .publishLast().refCount();

    // ensure ids received from routing correspond to real values when they're ready
    this.routeId$ = this.routingSvc.routeId$
      .delayWhen(() => this.totalList$)
      .map(ids => ids.filter(id => !!this.cachedSeiyuu[id]))
      .distinctUntilChanged((x,y) => x.slice().sort().join() == y.slice().sort().join())                   .do(Utils.asrt('S routeId', x => Array.isArray(x)));

    // load full details for selected seiyuu(s), batching requests together
    this.updateRequest$                                                                                    .do(Utils.lg('S updateRequest'))
      .bufferToggle(this.updateRequest$.throttleTime(200), () => Observable.timer(200))
      .flatMap(ids => this.loadByIds(ids))                                                                 .do(Utils.lg('Seiyuu details requested', 'warn'))
      .withLatestFrom(this.routeId$)
      .do(([seiyuus, ids]) => {
        seiyuus.forEach(seiyuu => {
          this.cachedSeiyuu[seiyuu._id].upgrade(seiyuu);
        });

        let ready = ids.map(id => this.cachedSeiyuu[id]).filter(s => !s.pending);
        if (seiyuus.length && ids.includes(seiyuus[0]._id) && ready.length) {
          this.loadedSeiyuu$.next(ready);
        }
      }).subscribe();

    // make the list of seiyuu to display out of both selected seiyuu and namesakes
    this.displayList$ = this.routeId$                                                                      .do(Utils.asrt('S routeId to displayList'))
      .map(ids => ids.map(id => this.cachedSeiyuu[id]))
      .do(seiyuus => {
        this.messageSvc.title(seiyuus);

        if (seiyuus.every(seiyuu => !seiyuu.pending)) {
          this.loadedSeiyuu$.next(seiyuus);
        }
      })
      .combineLatest(this.namesake$)
      .map(([seiyuus, namesakes]) => [...seiyuus, ...namesakes]);

    // set the last fully loaded seiyuu as currently active
    this.loadedSeiyuu$
      .subscribe(seiyuus => {
        if (seiyuus.length)
          this.selected$.next(seiyuus.slice(-1)[0]._id);
      });
  }

  requestUpdate(id: number) {
    this.updateRequest$.next(id);
  }

  pickNamesake(id: number) {
    this.picked$.next(id);
  }

  removeById(id: number) {
    this.routingSvc.remove(id);
    this.messageSvc.resetSearch$.next();
  }
  removeByName(name: string) {
    this.namesake$.next(this.namesake$.getValue().filter(nmsk => nmsk.displayName !== name));
  }

  addSearch(search$: Observable<string>) {
    const [found$, notFound$] = search$                                                                    .do(Utils.lg('Search'))
      .filter(value => !!value)
      .withLatestFrom(this.totalList$)
      .map(([name, list]) => list
        .filter(seiyuu =>
          !!Utils.unorderedCompare(name, seiyuu.name) || Utils.kanjiCompare(name, seiyuu.alternate_name)
        )
        .map(seiyuu => seiyuu._id))
      .partition(equals => !!equals.length);

    const [single$, multiple$] = found$                                                                    .do(Utils.lg('S found'))
      .withLatestFrom(this.displayList$
        .map(list => list.length))
      .filter(([,count]) => count < 4 || !!this.messageSvc.status('maximum of 4 people are allowed'))
      .map(([list]) => list)
      .share()
      .partition(list => list.length === 1);

    multiple$                                                                                              .do(Utils.lg('S multiple'))
      .map(ids => new BasicSeiyuu({namesakes: ids.map(id => this.cachedSeiyuu[id])}))
      .map(nmsks => Utils.unique([...this.namesake$.getValue(), nmsks], 'displayName'))
      .subscribe(namesakes => this.namesake$.next(namesakes));

    single$                                                                                                .do(Utils.lg('Single'))
      .map(ids => ids[0])
      .merge(this.picked$
        .do(id => this.removeByName(this.cachedSeiyuu[id].name)))
      .map(id => this.routingSvc.add(id))
      .filter(id => !!id)
      .do(id => this.messageSvc.status(`"${this.cachedSeiyuu[id].name}" is already selected`))
      .subscribe();

    notFound$                                                                                              .do(Utils.lg('S notFound'))
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
        f: {name: 1, count: 1, updated: 1, alternate_name: 1},
        s: {name: 1}
      }
    }).map(list => list.map(el => new BasicSeiyuu(el)))
      .do(list => list.forEach(seiyuu => this.cachedSeiyuu[seiyuu._id] = seiyuu))
      .catch(err => {
        this.messageSvc.error('Error getting cached list: '+err.status);

        console.warn(err.message, err.error && err.error.message);
        this.pending = false;

        throw err;
      });
  }

  getRanking(pending): Observable<BasicSeiyuu[]> {
    pending.is = true;

     return this.totalList$
      .do(list => {
        if (!this.rankingLoaded)
          this.rest.mongoCall({
            coll: 'seiyuu-test',
            mode: 'GET',
            query: {
              f: {hits: 1, accessed: 1}
            }
          })
            .do(newList => {
              newList.forEach(newSeiyuu => {
                let oldSeiyuu = list.find(seiyuu => seiyuu._id == newSeiyuu._id);
                oldSeiyuu && oldSeiyuu.upgrade(newSeiyuu);
              });

              this.rankingLoaded = true;
            })
            .finally(() =>pending.is = false)
            .subscribe()
        else
          pending.is = false;
      });
  }

}
