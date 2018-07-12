import { Injectable } from '@angular/core';
import {Subject} from "rxjs/Subject";

import {BasicSeiyuu } from "../../_models/seiyuu.model";

@Injectable()
export class SeiyuuServiceMock {
  displayList$: Subject<BasicSeiyuu[]> = new Subject();

  constructor() {  }

}
