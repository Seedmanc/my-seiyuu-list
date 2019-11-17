import {Subject} from "rxjs/Rx";
import {ErrorHandler, Injectable} from "@angular/core";
import * as Sentry from "@sentry/browser";

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  private errorStream$ = new Subject();
  private first: boolean = true;

  constructor() {
    this.errorStream$
      .debounceTime(250)
      .subscribe(data => {
        this.doHandle(data);
        this.first = true;
      });
  }

  handleError(error) {
    if (this.first) {
      this.doHandle(error);
      this.first = false;
    } else
      this.errorStream$.next(error);
  }

  private doHandle(error) {
    console.log(error);
    const eventId = Sentry.captureException(error.originalError || error);
    if (this.first)
      Sentry.showReportDialog({ eventId })
  }
}
