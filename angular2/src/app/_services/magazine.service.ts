import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {SeiyuuService} from "./seiyuu.service";
import {RoutingService} from "./routing.service";
import {Magazine} from "../_models/magazine.model";
import {Utils} from "./utils";
import {Seiyuu} from "../_models/seiyuu.model";
import {EMPTY} from "rxjs";
import {env} from "../../environments/environment";

@Injectable()
export class MagazineService {
  displayMagazines$: ReplaySubject<Magazine[]> = new ReplaySubject(1);
  pending = false;

  private cache: {[key: string]: Magazine[]} = {};

  constructor(private rest: RestService,
              private messageSvc: MessagesService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService) {

    this.seiyuuSvc.displayList$                                                               .do(Utils.asrt('M displayList', x => Array.isArray(x)))
      .let(this.routingSvc.runOnTab<Seiyuu[]>('magazines'))
      .map(seiyuus => seiyuus.map(seiyuu => seiyuu.displayName).sort())
      .switchMap(names => this.getMagazines(names))                                            .do(Utils.asrt('Magazine list'))
      .do(() => this.pending = false)
      .subscribe(this.displayMagazines$);
  }

  private getMagazines(names: string[]): Observable<Magazine[]> {
    this.pending = true;
    this.messageSvc.blank();

    return names.length ?

      this.cache[names.join()] ?
        of(this.cache[names.join()]) :
        this.rest.googleQueryCall(names)                                                      .do(Utils.lg('Magazines requested', 'warn'))
          .catch(response => {
            let error = response.error && response.error.message || response.message;

            this.messageSvc.error('Could not load magazines: '+ response.status);
            if (error)
              console.error(error);

            return EMPTY;
          })
          .map(response => {
            if (response.errors) {
               throw(response.errors[0].message);
            }

            let  {table: {rows}} = response;
            let hashOfMagazines = {};

            rows.forEach(({c: [{v: issue}, {v: magazine}, {v: seiyuus}] }) =>
              hashOfMagazines[magazine] = [...(hashOfMagazines[magazine] || []), {issue, seiyuus}]
            );

            return Object.keys(hashOfMagazines)
              .map(name => new Magazine(name, hashOfMagazines[name]));
          })
           .do(list => this.cache[names.join()] = list)
           .catch(err => {
             this.pending = false;
             this.messageSvc.error(err instanceof TypeError ? 'Incorrect response format' : err);

             return env.emptyInCatch ? EMPTY : _throw(err);
           })
          .finally(() => this.pending = false)

      : of(null);
  }

}
