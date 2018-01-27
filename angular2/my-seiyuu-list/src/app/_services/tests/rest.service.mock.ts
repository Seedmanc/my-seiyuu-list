import { Injectable } from '@angular/core';
import "rxjs/Rx";
import {Observable} from "rxjs/Observable";
import {basicModel, basicModel2, model, model2} from "../../_models/tests/seiyuu.model.spec";

@Injectable()
export class RestServiceMock {

  constructor( ) { }

  mongoCall({coll, mode, payload={}, query={}}) {
    let path = "collections/" + coll;

    if (JSON.stringify(payload) === '{}') {
      payload = undefined;
    }

    if (mode == "runCommand") {
      path = mode;
      mode = "POST";
    }

    let options = Object.keys(query).reduce((total, key) => total + `&${key}=${JSON.stringify(query[key])}`, '');
    console.info(arguments);

    return query['q'] && query['q']._id ? Observable.of([model,model2]) : Observable.of([basicModel,basicModel2]);
  }

}
