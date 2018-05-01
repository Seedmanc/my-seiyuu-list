import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';

import { PhotoListComponent } from './photo-list.component';
import {SpinnerComponent} from "../../spinner/spinner.component";
import {HttpClientModule} from "@angular/common/http";
import {RoutingService} from "../../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {RoutingServiceMock} from "../../_services/tests/routing.service.mock";
import {PhotoService} from "../../_services/photo.service";
import {MessagesService} from "../../_services/messages.service";
import {RestService} from "../../_services/rest.service";
import {RestServiceMock} from "../../_services/tests/rest.service.mock";
import {SeiyuuService} from "../../_services/seiyuu.service";

describe('PhotoListComponent', () => {
  let component: PhotoListComponent;
  let fixture: ComponentFixture<PhotoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoListComponent, SpinnerComponent ],
      providers: [{provide: RoutingService, useClass: RoutingServiceMock}, PhotoService, {provide: RestService, useClass: RestServiceMock},
      SeiyuuService, MessagesService],
      imports: [HttpClientModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display messages and switch pages', inject([MessagesService, PhotoService],
    (msgSvc: MessagesService, photoSvc: PhotoService) => {
    let x;
    photoSvc.pageDelta.subscribe(data => x = data);
    expect(x).toBeFalsy();
    component.switchPage(1);
    expect(x).toBe(1);
    let spy = spyOn(msgSvc, 'status');
    let spy2 = spyOn(msgSvc, 'blank');

    photoSvc.displayPhotos$.next({
      html:'',
      pageNum: 0,
      total: 25,
      next: false,
      prev: false
    });
    expect(spy).toHaveBeenCalledWith('25 images found');

    photoSvc.displayPhotos$.next({
      html:'',
      pageNum: 0,
      total: 0,
      next: false,
      prev: false
    });
    expect(spy2).toHaveBeenCalled();
  }));
});
