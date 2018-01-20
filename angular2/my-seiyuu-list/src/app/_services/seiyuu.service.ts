import { Injectable } from '@angular/core';
import {BasicSeiyuu, Seiyuu} from "../_models/seiyuu.model";
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Utils} from "./utils.service";
import {RoutingService} from "./routing.service";
import {AnimeService} from "./anime.service";

@Injectable()
export class SeiyuuService {
  totalList$: Observable<BasicSeiyuu[]>;
  updateRequest$: Subject<number> = new Subject();
  displayList$: Observable<BasicSeiyuu[]>;
  picked$: Subject<number> = new Subject();
  removed$: Subject<number|string> = new Subject();

  pending: boolean = true;

  private routeId$: Observable<number[]>;
  private namesake$: Subject<BasicSeiyuu[]> = new BehaviorSubject([]);
  private totalMap: {[key:number]: BasicSeiyuu} = {};


  constructor(private rest:RestService, private messageSvc: MessagesService,
              private routingSvc: RoutingService, private animeSvc:AnimeService) {

    this.totalList$ = this.getTotalList()
      .do(list => this.animeSvc.animeCount$
        .subscribe(number => this.messageSvc.status(list.length + ` seiyuu & ${number} anime records cached`))
      )
      .do(_ => this.pending = false)
      .publishLast().refCount();

    this.routeId$ = this.routingSvc.routeId$
      .delayWhen(()=>this.totalList$)
      .map(ids => ids.filter(id => !!this.totalMap[id]));

    this.updateRequest$.bufferTime(300)
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
      .map(([name,list]) => list.filter(seiyuu => !!Utils.unorderedEquals(name, seiyuu.name)).map(seiyuu => seiyuu._id))
      .partition(equals => !!equals.length);

    let [single, multiple] = found.do(_=>this.messageSvc.blank()).partition(list => list.length === 1);

    multiple.map(ids => [{name: this.totalMap[ids[0]].name,  namesakes: ids.map(id => this.totalMap[id])}])
      .withLatestFrom(this.namesake$, (New, old) => Utils.unique([...old, ...New], 'name'))
      .subscribe(namesakes => this.namesake$.next(<BasicSeiyuu[]>namesakes));

    single
      .map(ids => ids[0])
      .merge(this.picked$
        .do(id => this.removed$.next(this.totalMap[id].name))
      )
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
      mode: 'get',
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
      mode: 'get',
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
