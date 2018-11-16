import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {RoutingService} from "../../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {RoutingServiceMock} from "../../_services/tests/routing.service.mock";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {MessagesService} from "../../_services/messages.service";
import {SeiyuuService} from "../../_services/seiyuu.service";
import {SpinnerComponent} from "../../spinner/spinner.component";
import {PhotoListComponent} from "./photo-list.component";
import {PhotoService} from "../../_services/photo.service";
import {model} from "../../_models/tests/seiyuu.model.spec";
import {Seiyuu} from "../../_models/seiyuu.model";

describe('PhotoListComponent', () => {
  let component: PhotoListComponent;
  let fixture: ComponentFixture<PhotoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoListComponent , SpinnerComponent],
      providers: [{provide: RoutingService, useClass: RoutingServiceMock}, PhotoService, MessagesService, SeiyuuService],
      imports: [RouterTestingModule,  HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should report results', inject([PhotoService, MessagesService, SeiyuuService],
    (service: PhotoService, msgSvc: MessagesService, seiyuuSvc:SeiyuuService) => {
      let spy = spyOn(msgSvc, 'results');

      service.displayPhotos$.next({});
      expect(spy).toHaveBeenCalledWith(undefined, 0, 'photos');
      spy.calls.reset();

      service.displayPhotos$.next({total: 1});
      expect(spy).toHaveBeenCalledWith('1 photo', 0, 'photos');
      spy.calls.reset();

      seiyuuSvc.displayList$.next([new Seiyuu(model)]);
      service.displayPhotos$.next({total: 2});
      expect(spy).toHaveBeenCalledWith('2 photos', 1, 'photos');
      spy.calls.reset();
    })
  );
});
