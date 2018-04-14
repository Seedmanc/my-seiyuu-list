import {Component, Input, OnInit} from '@angular/core';

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
export class SpinnerComponent implements OnInit {

  @Input() size?: string = '28px';
  @Input() float?: string = 'none';

  constructor() { }

  ngOnInit() {
  }

}
