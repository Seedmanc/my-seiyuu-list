import {Component, Input} from '@angular/core';

import {BusService} from "../_services/bus.service";

@Component({
  selector: 'msl-toggle-chart',
  templateUrl: './toggle-chart.component.html',
  styleUrls: ['./toggle-chart.component.css']
})
export class ToggleChartComponent {
  @Input() disabled: boolean;

  constructor(public bus: BusService) {  }

}
