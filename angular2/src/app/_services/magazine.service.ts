import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {SeiyuuService} from "./seiyuu.service";
import {RoutingService} from "./routing.service";
import {Magazine} from "../_models/magazine.model";
import {Utils} from "./utils.service";
import {Seiyuu} from "../_models/seiyuu.model";

@Injectable()
export class MagazineService {
  display$: BehaviorSubject<any> = new BehaviorSubject([]);
  pending = false;

  private cache: {[key: string]: Magazine[]} = {};

  constructor(private rest: RestService,
              private messageSvc: MessagesService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService) {

    this.seiyuuSvc.displayList$                                                                   .do(Utils.asrt('M displayList', x => Array.isArray(x)))
      .let(Utils.runOnTab<Seiyuu[]>(this.routingSvc.tab$, 'magazines'))
      .map(seiyuus => seiyuus.map(seiyuu => seiyuu.displayName).sort())
      .switchMap(names => this.getMagazines(names))                                               .do(Utils.asrt('Magazine list'))
      .do(() => this.pending = false)
      .let(Utils.replayOnTab<Magazine[]>(this.routingSvc.tab$, 'magazines'))
      .withLatestFrom(this.seiyuuSvc.displayList$)
      .map(([magazines,seiyuus]) => {
        let iss = magazines.reduce((p, c) => p + c.issues.length, 0);

        if (seiyuus.length)
          this.messageSvc.status(
            magazines.length ?
              `found ${iss} issue${Utils.pluralize(iss)} in ${magazines.length} magazine${Utils.pluralize(magazines.length)}`:
              'no magazines found'
          );
        return magazines;
      })
      .subscribe(this.display$);
  }

  private getMagazines(names: string[]): Observable<Magazine[]> {
    this.pending = true;
    this.messageSvc.blank();

    return names.length ?

      this.cache[names.join()] ?

        Observable.of(this.cache[names.join()])
        : this.rest.googleQueryCall(names)                                                      .do(Utils.lg('Magazines requested', 'warn'))
          .catch(err => {
            let result = Observable.of(err);

            if (err.error && err.error.message.includes('callback'))
              result = Observable.empty()
            else
              this.pending = false;

            return result;
          })
          .map(({table: {rows}}) => {
            let hashOfMagazines = {};

            rows.forEach(({c: [{v: issue}, {v: magazine}, {v: seiyuus}] }) =>
              hashOfMagazines[magazine] = [...(hashOfMagazines[magazine] || []), {issue, seiyuus}]
            );

            return Object.keys(hashOfMagazines)
              .map(name => new Magazine(name, hashOfMagazines[name]));
          })
          .do(list => this.cache[names.join()] = list)

      : Observable.of([]);
  }

}
