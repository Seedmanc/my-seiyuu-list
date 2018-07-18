import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

import {RestService} from "./rest.service";
import {MessagesService} from "./messages.service";
import {SeiyuuService} from "./seiyuu.service";
import {RoutingService} from "./routing.service";
import {Magazine} from "../_models/magazine.model";

@Injectable()
export class MagazineService {
  display$: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private rest: RestService,
              private msgSvc: MessagesService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService) {
/*
    this.seiyuuSvc.loadedSeiyuu$                                                                   .do(Utils.asrt('M loadedSeiyuu', x => Array.isArray(x)))
      .let(Utils.runOnTab<Seiyuu[]>(this.routingSvc.tab$, 'magazines'))

      .subscribe(this.display$);*/

    this.rest.googleQueryCall(['Horie Yui'])
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
      })
      .subscribe(this.display$);
  }

}
