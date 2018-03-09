import { Component } from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {RoutingService} from "../_services/routing.service";
import {AnimeService} from "../_services/anime.service";

@Component({
  selector: 'msl-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
  providers: [RoutingService, SeiyuuService, AnimeService]
})
export class BaseComponent {

  constructor(public seiyuuSvc: SeiyuuService) {}

}
