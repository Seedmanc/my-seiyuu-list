import { Injectable } from '@angular/core';

import {BasicSeiyuu } from "../../_models/seiyuu.model";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class SeiyuuServiceMock {
  displayList$: BehaviorSubject<BasicSeiyuu[]> = new BehaviorSubject([]);

  constructor() {  }

}
