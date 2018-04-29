import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../../_services/routing.service";
import {ChildParamsComponent} from "../../_misc/child-params.component";

@Component({
  selector: 'msl-magazine-list',
  templateUrl: './magazine-list.component.html',
  styleUrls: ['./magazine-list.component.css']
})
export class MagazineListComponent extends ChildParamsComponent implements OnInit {

  constructor(protected route: ActivatedRoute, protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

}
