import {Component} from '@angular/core';

import {BusService} from "../_services/bus.service";
import {RoutingService} from "../_services/routing.service";

@Component({
  selector: 'msl-toggle-chart',
  templateUrl: './toggle-chart.component.html',
  styleUrls: ['./toggle-chart.component.css']
})
export class ToggleChartComponent {

  constructor(public bus: BusService, public routingSvc: RoutingService) {  }

}
