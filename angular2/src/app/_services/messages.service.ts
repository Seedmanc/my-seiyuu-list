import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {BasicSeiyuu} from "../_models/seiyuu.model";

export class MessagesService {
  message$: Subject<{isError?:boolean, data?: string}> = new BehaviorSubject({});
  resetSearch$ = new Subject();

  private counts = {
    seiyuu: 0,
    anime: 0
  };

  constructor() { }

  error(text) {
    this.message$.next({isError: true, data: text});
  }

  status(text) {
    this.message$.next({isError: false, data: text});
  }

  totals() {
    if (this.counts.seiyuu)
      this.status(this.counts.seiyuu + ` seiyuu ${this.counts.anime ? '& ' +this.counts.anime+' anime ' : ''}records cached`)
    else
      this.error('no cached records found');
  }

  blank() {
    this.message$.next({});
  }

  title(seiyuus: BasicSeiyuu[]) {
    document.title = `My Seiyuu List ${seiyuus.length ? 
      ' - ' + seiyuus.map(seiyuu => seiyuu.name).join(', ') :
      ''}`;
  }

  setTotals(counts: any) {
    Object.assign(this.counts, counts);
  }
}
