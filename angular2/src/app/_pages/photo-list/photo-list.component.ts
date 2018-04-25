import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {ChildParamsComponent} from "../../child-params.component";
import {RoutingService} from "../../_services/routing.service";
import {PhotoService} from "../../_services/photo.service";

@Component({
  selector: 'msl-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent extends ChildParamsComponent implements OnInit {
  photoPage: string;
  pending: boolean = true;
  hasNext: false;
  hasPrev: false;

  constructor(private photoSvc: PhotoService,
              protected route: ActivatedRoute,
              protected routingSvc: RoutingService) {
    super(route, routingSvc);
  }

  ngOnInit() {
    super.ngOnInit();

    this.photoSvc.getPhotoPage(['Mizuki Nana', 'solo'], 0)
      .do(() => this.pending = false)
      .subscribe(result => this.photoPage = result);
  }

}
