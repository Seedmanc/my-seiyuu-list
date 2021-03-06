import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {timer} from "rxjs/observable/timer";
import {of} from "rxjs/observable/of";
import 'rxjs/add/operator/do';
import {EMPTY} from "rxjs";
import {BasicSeiyuu,  Seiyuu} from "../_models/seiyuu.model";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {Utils} from "./utils";
import {RoutingService} from "./routing.service";
import {env} from "../../environments/environment";

@Injectable({providedIn: 'root'})
export class SeiyuuService {
  totalList$: Observable<BasicSeiyuu[]>;
  displayList$: BehaviorSubject<BasicSeiyuu[]> = new BehaviorSubject([]);
  loadedSeiyuu$: BehaviorSubject<Seiyuu[]> = new BehaviorSubject([]);
  selected$: BehaviorSubject<number> = new BehaviorSubject(null);

  pending: boolean = true;

  get selectedSeiyuu(): string[] {
    return this.displayList$.getValue()
      .map(({displayName}) => displayName);
  }

  readonly search$ = new Subject<string>();
  private rankingLoaded = false;
  private routeId$: Observable<number[]>;
  private picked$: Subject<number> = new Subject();
  private updateRequest$: Subject<number> = new Subject();
  private namesake$: BehaviorSubject<BasicSeiyuu[]> = new BehaviorSubject([]);
  private cachedSeiyuu: {[key: number]: BasicSeiyuu} = {};
  private totalHash: {[key: string]: boolean} = {};


  constructor(private rest: RestService,
              private messageSvc: MessagesService,
              private routingSvc: RoutingService) {

    // load the brief list of all seiyuu in DB, minus the roles, photos, hits & last accessed
    this.totalList$ = this.getTotalList()                                                                  .do(Utils.lg('Seiyuu list requested', 'warn'))
      .do(() => this.pending = false)
      .publishLast().refCount();

    this.totalList$.subscribe(list => {
      this.totalHash = {};
      list.forEach(bs => this.totalHash[bs.displayName] = true);
    });

    // ensure ids received from routing correspond to real values when they're ready
    this.routeId$ = this.routingSvc.routeId$.skip(1)
      .delayWhen(() => this.totalList$)
      .map(ids => ids.filter(id => !!this.cachedSeiyuu[id]))                                               .do(Utils.asrt('S routeId', x => Array.isArray(x)))
      .share();

    // load full details for selected seiyuu(s), batching requests together
    this.updateRequest$                                                                                    .do(Utils.lg('S updateRequest'))
      .bufferToggle(this.updateRequest$.throttleTime(200), () => timer(200))
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
    this.routeId$                                                                                           .do(Utils.asrt('S routeId to displayList'))
      .map(ids => ids.map(id => this.cachedSeiyuu[id]))
      .do(seiyuus => {
        MessagesService.title(seiyuus);

        if (seiyuus.every(seiyuu => !seiyuu.pending)) {
          this.loadedSeiyuu$.next(seiyuus);
        }
      })
      .combineLatest(this.namesake$)
      .map(([seiyuus, namesakes]) => [...seiyuus, ...namesakes])
      .subscribe(this.displayList$);

    // set the last fully loaded seiyuu as currently active
    this.loadedSeiyuu$
      .delayWhen(() => this.totalList$)
      .subscribe(seiyuus => {
        if (seiyuus.length) {
          this.selected$.next(seiyuus.slice(-1)[0]._id);
        } else
          this.messageSvc.totals();
      });

    this.addSearch();
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

  private addSearch() {
    const [found$, notFound$] = this.search$                                                               .do(Utils.lg('Search'))
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
      .filter(([,count]) => count < 4 || this.messageSvc.status('maximum of 4 people are allowed'))
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
      .withLatestFrom(this.search$)
      .subscribe(([,search]) => this.messageSvc.error(`"${search}" is not found`));
  }

  isAvailable(name: string): boolean {
    return this.totalHash[name];
  }

  getRanking(pending): Observable<BasicSeiyuu[]> {
    pending.is = true;

    return this.totalList$
      .do(list => {
        if (!this.rankingLoaded)
          this.rest.mongoCall({
            coll: env.seiyuuDB,
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
            .finally(() => pending.is = false)
            .subscribe()
        else
          pending.is = false;
      });
  }

  addSeiyuu(name: string) {
    this.search$.next(name);
  }

  private loadByIds(ids: number[]): Observable<Seiyuu[]> {
    return this.rest.mongoCall({
      coll: env.seiyuuDB,
      mode: 'GET',
      query: {
        q: {
           _id: {'$in': ids}
        }
      }
    }).map(list => list.map(el => new Seiyuu(el)))
      .catch(response => {
        setTimeout(() =>  this.messageSvc.error('Error loading seiyuu details: ' + response.status));
        let error = response.error && (response.error.message || response.error.text) || response.message;

        console.error(error);
        ids.forEach(id => this.removeById(id));

        return of([]);
      });
  }

  private getTotalList(): Observable<BasicSeiyuu[]> {
    return this.rest.mongoCall({
      coll: env.seiyuuDB,
      mode: 'GET',
      query: {
        f: {name: 1, count: 1, updated: 1, alternate_name: 1},
        s: {name: 1}
      }
    }).map(list => list.map(el => new BasicSeiyuu(el)))
      .do(list => list.forEach(seiyuu => this.cachedSeiyuu[seiyuu._id] = seiyuu))
      .do(list => this.messageSvc.setTotals({seiyuu: list.length}))
      .catch(response => {
         setTimeout(() => //TODO no timeouts
           this.messageSvc.error('Error getting cached list: ' + response.status), 250
         );
        let error = response.error && (response.error.message || response.error.text) || response.message;

        console.error(error);
        this.pending = false;

        return EMPTY;
      });
  }

}
