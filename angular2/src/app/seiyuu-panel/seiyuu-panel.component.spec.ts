import {async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { SeiyuuPanelComponent } from './seiyuu-panel.component';
import {SpinnerComponent} from "../spinner/spinner.component";
import {SeiyuuService} from "../_services/seiyuu.service";
import {AnimeService} from "../_services/anime.service";
import {RestService} from "../_services/rest.service";
import {RoutingService} from "../_services/routing.service";
import {HttpClientModule} from "@angular/common/http";
import {RouterTestingModule} from "@angular/router/testing";
import {MessagesService} from "../_services/messages.service";
import {BasicSeiyuu, Seiyuu} from "../_models/seiyuu.model";
import {RestServiceMock} from "../_services/tests/rest.service.mock";
import {basicModel, model} from "../_models/tests/seiyuu.model.spec";
import {RoutingServiceMock} from "../_services/tests/routing.service.mock";

describe('SeiyuuPanelComponent', () => {
  let component: SeiyuuPanelComponent;
  let fixture: ComponentFixture<SeiyuuPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeiyuuPanelComponent, SpinnerComponent ],
      providers:[SeiyuuService, AnimeService, {provide: RestService, useClass: RestServiceMock},
        {provide: RoutingService, useClass: RoutingServiceMock} , MessagesService],
      imports:[HttpClientModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeiyuuPanelComponent);
    component = fixture.componentInstance;
    component.seiyuu = new Seiyuu(basicModel);
  });

  it('should display name and spinner for basicSeiyuu or namesakes',  () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h4').textContent).toContain('Maeda Konomi');
    expect(fixture.nativeElement.querySelector('msl-spinner')).toBeTruthy();
    component.seiyuu = new BasicSeiyuu({namesakes: [new BasicSeiyuu(basicModel), new BasicSeiyuu(basicModel)]});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h4').textContent).toContain('Maeda Konomi');
  });

  it('should display photo for seiyuu',
    () => {
      component.seiyuu = new Seiyuu(model);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.vapic')).toBeTruthy();
    }
  );

  it('should emit on seiyuu/namesake removal',
    inject([SeiyuuService], (svc: SeiyuuService)=> {
      fixture.detectChanges();
      let rbi = spyOn(svc, 'removeById');
      let rbn = spyOn(svc, 'removeByName');

      fixture.nativeElement.querySelector('.remove.close').click();
      expect(rbi).toHaveBeenCalledWith(basicModel._id);

      component.seiyuu = new BasicSeiyuu({namesakes: [new BasicSeiyuu(basicModel), new BasicSeiyuu(basicModel)]});
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.remove.close').click();
      expect(rbn).toHaveBeenCalledWith('Maeda Konomi');
    })
  );

});
