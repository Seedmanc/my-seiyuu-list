import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";

import {PageComponent} from "../page.component";
import {RoutingService} from "../../_services/routing.service";
import {PhotoPage, PhotoService} from "../../_services/photo.service";
import {Utils} from "../../_services/utils.service";
import {MessagesService} from "../../_services/messages.service";

@Component({
  selector: 'msl-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent extends PageComponent implements OnInit {
  photoPage: PhotoPage;

  constructor(public photoSvc: PhotoService,
              private messageSvc: MessagesService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.photoSvc.displayPhotos$
      .takeUntil(this.unsubscribe$)                                                                       .do(Utils.asrt('photo'))
      .do(page =>
        this.messageSvc.results(
          page,
          page => `${page.total} [photo]${Utils.pluralize(page.total)}`
        )
      )
      .subscribe(result => this.photoPage = result);
  }


}
