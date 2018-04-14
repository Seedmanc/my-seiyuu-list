import { Component, OnInit } from '@angular/core';
import {RoutingService} from "../_services/routing.service";

@Component({
  selector: 'msl-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {
  ids: string = '';

  constructor(private routingSvc: RoutingService) { }

  ngOnInit() {
    this.routingSvc.paramMap$.subscribe(params => this.ids = params.get('ids') );
  }

}
