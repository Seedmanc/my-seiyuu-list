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
import {model} from "../../_models/tests/seiyuu.model.spec";
import {Seiyuu} from "../../_models/seiyuu.model";
import {isNullOrUndefined} from "util";

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

  it('should report results', inject([MagazineService, MessagesService, SeiyuuService],
    (service: MagazineService, msgSvc: MessagesService, seiyuuSvc:SeiyuuService) => {
      let spy = spyOn(msgSvc, 'results');
      let l = [];
      service.displayMagazines$.next(l);

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0]).toBe(l);
      expect(spy.calls.mostRecent().args[2]).toBe(undefined);
    })
  );
});
