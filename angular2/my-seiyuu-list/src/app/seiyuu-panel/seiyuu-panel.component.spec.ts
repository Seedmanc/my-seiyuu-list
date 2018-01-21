import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeiyuuPanelComponent } from './seiyuu-panel.component';
import {SpinnerComponent} from "../spinner/spinner.component";
import {SeiyuuService} from "../_services/seiyuu.service";
import {AnimeService} from "../_services/anime.service";
import {RestService} from "../_services/rest.service";
import {RoutingService} from "../_services/routing.service";
import {HttpClientModule} from "@angular/common/http";
import {RouterTestingModule} from "@angular/router/testing";
import {MessagesService} from "../_services/messages.service";
import { Seiyuu} from "../_models/seiyuu.model";

describe('SeiyuuPanelComponent', () => {
  let component: SeiyuuPanelComponent;
  let fixture: ComponentFixture<SeiyuuPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeiyuuPanelComponent, SpinnerComponent ],
      providers:[SeiyuuService, AnimeService, RestService, RoutingService, MessagesService],
      imports:[HttpClientModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeiyuuPanelComponent);
    component = fixture.componentInstance;
    component.seiyuu=new Seiyuu({
        _id: 53,
        name: 'Chihara Minori',
        hits: 3,
        count: 3,
        updated: new Date(),
        accessed: new Date()
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
