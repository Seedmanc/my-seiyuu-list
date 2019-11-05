import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {BasicSeiyuu} from "../_models/seiyuu.model";
import {Utils} from "./utils.service";

export class MessagesService {
  message$: BehaviorSubject<{isError?:boolean, data?: string}> = new BehaviorSubject({});
  resetSearch$ = new Subject();

  private counts: any = {};

  constructor() { }

  error(text) {
    this.message$.next({isError: true, data: text});
  }

  status(text) {
    this.message$.next({isError: false, data: text});
    return false;
  }

  totals() {
    if (this.counts.seiyuu === 0) {
      this.error('no cached records found');
    } else if (this.counts.seiyuu || this.counts.anime)
      this.status(this.counts.seiyuu + ` seiyuu ${this.counts.anime ? '& ' + this.counts.anime + ' anime ' : ''}records cached`)
  }

  blank() {
    this.message$.next({});
  }

  title(seiyuus: BasicSeiyuu[]) {
    document.title = `My Seiyuu List ${seiyuus.length ? 
      ' - ' + seiyuus.map(seiyuu => seiyuu.name).join(', ') :
      ''}`;
  }

  results(list: any, template: ((number) => string)) {
    if (list) {
      let text = template(list);
      let count = list.length || list.total || 0;
      let match = text.match(/\[(.+?)\]/g);

      if (!count)
        text = match ?
          ('no ' + match) :
          text;
      if (match) {
        text = text + Utils.pluralize(count);
      }
      this.status(text.replace(/^0\s/,'no ').replace(/[\[\]]/g, '') + ' found');
    } else {
      this.totals();
    }
  }

  setTotals(counts: any) {
    Object.assign(this.counts, counts);
  }
}
