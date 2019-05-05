import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {fromEvent} from "rxjs/observable/fromEvent";
import {AnimeService} from "../_services/anime.service";

@Component({
  selector: 'msl-toggle-chart',
  templateUrl: './toggle-chart.component.html',
  styleUrls: ['./toggle-chart.component.css']
})
export class ToggleChartComponent implements OnInit{
  @Input() disabled: boolean;
  @ViewChild('toggle') toggle: ElementRef<HTMLInputElement>;

  constructor(public animeSvc: AnimeService) {  }

  ngOnInit() {
    fromEvent(this.toggle.nativeElement, 'change')
      .map(event => event.target['checked'])
      .subscribe(this.animeSvc.toggleChart$);

    this.animeSvc.toggleChart$
      .subscribe(checked => this.toggle.nativeElement.checked = checked);
  }
}
