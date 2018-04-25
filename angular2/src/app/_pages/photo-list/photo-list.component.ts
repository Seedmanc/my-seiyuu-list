import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {ChildParamsComponent} from "../../child-params.component";
import {RoutingService} from "../../_services/routing.service";
import {PhotoService} from "../../_services/photo.service";
import {Utils} from "../../_services/utils.service";

@Component({
  selector: 'msl-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent extends ChildParamsComponent implements OnInit {
  page: string;
  next: false;
  prev: false;

  constructor(public photoSvc: PhotoService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.photoSvc.displayPhotos$                                                                  .do(Utils.log('photo'))
      .subscribe(result => Object.assign(this, result));
  }

  switchPage(delta: number) {
    this.photoSvc.pageDelta.next(delta);
  }

}
