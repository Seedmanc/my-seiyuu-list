import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export class MessagesService {

  message$: Subject<{isError?:boolean, data?: string}> = new BehaviorSubject({});
  resetSearch$ = new Subject();

  constructor() { }

  error(text) {
    this.message$.next({isError: true, data: text});
  }

  status(text) {
    this.message$.next({isError: false, data: text});
  }

  totals(s?: number, a?: number) {
    if (s)
      this.status(s + ` seiyuu ${a ? '& ' +a+' anime ' : ''}records cached`)
    else
      this.error('no cached records found');
  }

  blank() {
    this.message$.next({});
  }

}
