import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {RoutingService} from "../../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {RoutingServiceMock} from "../../_services/tests/routing.service.mock";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {MessagesService} from "../../_services/messages.service";
import {SeiyuuService} from "../../_services/seiyuu.service";
import {MagazineListComponent} from "./magazine-list.component";
import {MagazineService} from "../../_services/magazine.service";
import {SpinnerComponent} from "../../spinner/spinner.component";

describe('MagazineListComponent', () => {
  let component: MagazineListComponent;
  let fixture: ComponentFixture<MagazineListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MagazineListComponent, SpinnerComponent ],
      providers: [{provide: RoutingService, useClass: RoutingServiceMock}, MagazineService, MessagesService, SeiyuuService],
      imports: [RouterTestingModule,  HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MagazineListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should report results', inject([MagazineService, MessagesService],
    (service: MagazineService, msgSvc: MessagesService) => {
      let spy = spyOn(msgSvc, 'results');

      service.displayMagazines$.next([[{issues:[]}], 0]);
      expect(spy).toHaveBeenCalledWith('0 issues in 1 magazine', 0, 'magazines');
      spy.calls.reset();

      service.displayMagazines$.next([[{issues:[1]}], 1]);
      expect(spy).toHaveBeenCalledWith('1 issue in 1 magazine', 1, 'magazines');
      spy.calls.reset();

      service.displayMagazines$.next([[{issues:[1,2]},{issues:[1]}], 1]);
      expect(spy).toHaveBeenCalledWith('3 issues in 2 magazines', 1, 'magazines');
    })
  );
});
