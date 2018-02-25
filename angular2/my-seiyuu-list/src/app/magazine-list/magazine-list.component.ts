import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {RoutingService} from "../_services/routing.service";

@Component({
  selector: 'msl-magazine-list',
  templateUrl: './magazine-list.component.html',
  styleUrls: ['./magazine-list.component.css']
})
export class MagazineListComponent implements OnInit {

  constructor(private route: ActivatedRoute, private routingSvc: RoutingService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(this.routingSvc.paramMap$);
  }

}
