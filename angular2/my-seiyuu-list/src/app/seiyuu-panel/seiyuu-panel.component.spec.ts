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

describe('SeiyuuPanelComponent', () => {
  let component: SeiyuuPanelComponent;
  let fixture: ComponentFixture<SeiyuuPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeiyuuPanelComponent, SpinnerComponent ],
      providers:[SeiyuuService, AnimeService, {provide: RestService, useClass: RestServiceMock}, RoutingService, MessagesService],
      imports:[HttpClientModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeiyuuPanelComponent);
    component = fixture.componentInstance;
    component.seiyuu = new Seiyuu(basicModel);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display name and spinner for basicSeiyuu or namesakes',  () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h4').textContent).toContain('Maeda Konomi');
    expect(fixture.nativeElement.querySelector('msl-spinner')).toBeTruthy();
    component.seiyuu = <Seiyuu>{name: 'Maeda Konomi', namesakes: [basicModel,basicModel]};
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h4').textContent).toContain('Maeda Konomi');
  });

  it('should send update request for basicSeiyuu',
    inject([SeiyuuService], (svc: SeiyuuService)=> {
      let x;
      svc.updateRequest$.subscribe(r=>x=r);
      fixture.detectChanges();
      expect(x).toBe(basicModel._id);
    })
  );

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
      let x; svc.removed$.subscribe(r=>x=r);
      fixture.nativeElement.querySelector('.remove.close').click();
      expect(x).toBe(basicModel._id);

      component.seiyuu = <Seiyuu>{name: 'Maeda Konomi', namesakes: [basicModel,basicModel]};
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.remove.close').click();
      expect(x).toBe('Maeda Konomi');
    })
  );

});
