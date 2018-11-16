import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";

import {PageComponent} from "../../_misc/page.component";
import {RoutingService} from "../../_services/routing.service";
import {PhotoService} from "../../_services/photo.service";
import {Utils} from "../../_services/utils.service";
import {MessagesService} from "../../_services/messages.service";
import {SeiyuuService} from "../../_services/seiyuu.service";

@Component({
  selector: 'msl-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent extends PageComponent implements OnInit {
  html: string;
  next: false;
  prev: false;
  pageNum: 0;

  constructor(public photoSvc: PhotoService,
              private messageSvc: MessagesService,
              private seiyuuSvc: SeiyuuService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.photoSvc.displayPhotos$
      .takeUntil(this.unsubscribe$)                                                                       .do(Utils.asrt('photo'))
      .do(page => {
        this.messageSvc.results(
          page.total && `${page.total} photo${Utils.pluralize(page.total)}`,
          this.seiyuuSvc.displayList$.getValue().length,
          'photos'
        );
      })
      .subscribe(result =>  Object.assign(this, result));
  }


}
