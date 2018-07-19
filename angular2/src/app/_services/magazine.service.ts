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

  constructor(private rest: RestService,
              private msgSvc: MessagesService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService) {

    this.seiyuuSvc.loadedSeiyuu$                                                                   .do(Utils.asrt('M loadedSeiyuu', x => Array.isArray(x)))
      .let(Utils.runOnTab<Seiyuu[]>(this.routingSvc.tab$, 'magazines'))
      .map(seiyuus => seiyuus.map(seiyuu => seiyuu.displayName))
      .switchMap(names => this.getMagazines(names))
      .do(magazines => {
        let iss = magazines.reduce((p, c) => p + c.issues.length, 0);

        if (this.seiyuuSvc.loadedSeiyuu$.getValue().length)
          this.msgSvc.status(
            magazines.length ?
              `found ${iss} issue${Utils.pluralize(iss)} in ${magazines.length} magazine${Utils.pluralize(magazines.length)}`:
              'no magazines found'
          );
        this.pending = false;
      })
      .finally(() => this.pending = false)
      .subscribe(this.display$);
  }

  private getMagazines(names: string[]): Observable<Magazine[]> {
    this.pending = true;

    return names.length ?
      this.rest.googleQueryCall(names)
        .catch(err => {
          let result = Observable.of(err);

          if (err.error && err.error.message.includes('callback'))
            result = Observable.empty();
          return result;
        })
        .map(({table: {rows}}) => {
          let hashOfMagazines = {};

          rows.forEach(({c: [{v: issue}, {v: magazine}, {v: seiyuus}] }) =>
            hashOfMagazines[magazine] = [...(hashOfMagazines[magazine] || []), {issue, seiyuus}]
          );

          return Object.keys(hashOfMagazines)
            .map(name => new Magazine(name, hashOfMagazines[name]));
        }) :
      Observable.of([]);
  }

}
