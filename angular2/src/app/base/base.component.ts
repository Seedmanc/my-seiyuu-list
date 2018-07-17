import { Component } from '@angular/core';
import {SeiyuuService} from "../_services/seiyuu.service";
import {RoutingService} from "../_services/routing.service";
import {AnimeService} from "../_services/anime.service";
import {PhotoService} from "../_services/photo.service";
import {MagazineService} from "../_services/magazine.service";

@Component({
  selector: 'msl-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
  providers: [RoutingService, SeiyuuService, AnimeService, PhotoService, MagazineService]
})
export class BaseComponent {

  constructor(public seiyuuSvc: SeiyuuService) {
    console.clear();
  }

}
