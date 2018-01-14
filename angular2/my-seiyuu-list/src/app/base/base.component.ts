import { Component } from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {RoutingService} from "../_services/routing.service";

@Component({
  selector: 'msl-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
  providers: [RoutingService, SeiyuuService]
})
export class BaseComponent {

  constructor(public seiyuuSvc: SeiyuuService) {}

}
