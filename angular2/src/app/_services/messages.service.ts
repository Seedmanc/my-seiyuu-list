import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {BasicSeiyuu} from "../_models/seiyuu.model";

export class MessagesService {
  message$: Subject<{isError?:boolean, data?: string}> = new BehaviorSubject({});
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

  results(list: any, template: ((number) => string), singular?: boolean) {
    if (list) {
      let text = template(list);
      let type = text.match(/\[(.+?)\]/g)[0] + (singular ? '' : 's');
      let result = (list.length || list.total) ?
        text :
        'no '+type;
      this.status(result.replace(/[\[\]]/g,'') + ' found');
    } else {
      this.totals();
    }
  }

  setTotals(counts: any) {
    Object.assign(this.counts, counts);
  }
}
