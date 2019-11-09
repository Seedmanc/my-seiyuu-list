import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MessagesService} from "../_services/messages.service";

@Component({
  selector: 'msl-spinner',
  template: `<div class="sp-circle" [ngStyle]="{float: float, width:size, height:size}"></div>`,
  styles: [`
    .sp-circle {
      display: inline-block;
      margin-top: 3px;

      border: 3px rgba(0, 0, 0, 0.25) solid;
      border-top: 3px white solid;
      border-radius: 50%;

      animation: spCircRot 1s infinite linear;
    }
    @keyframes spCircRot {
      from { transform: rotate(0deg); }
      to { transform: rotate(359deg); }
    }
  `]
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @Input() size?: string = '28px';
  @Input() float?: string = 'none';
  @Input() setStatus?: boolean;

  constructor(private messageService: MessagesService) { }

  ngOnInit() {
    if (this.setStatus)
      this.messageService.status('loading...');
  }

  ngOnDestroy() {
    if (this.setStatus && this.messageService.message$.getValue() == 'loading...')
      this.messageService.blank();
  }

}
