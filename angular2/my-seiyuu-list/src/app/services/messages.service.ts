import { Injectable } from '@angular/core';
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class MessagesService {

  message$: Subject<{isError?:boolean, data?: string}> = new BehaviorSubject({});

  constructor() { }

  error(text) {
    this.message$.next({isError: true, data: text});
  }

  status(text) {
    this.message$.next({isError: false, data: text});
  }

}
