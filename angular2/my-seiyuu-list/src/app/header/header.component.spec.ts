import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import {FormsModule} from "@angular/forms";
import {UniqPipe} from "../uniq.pipe";
import {SpinnerComponent} from "../spinner/spinner.component";
import {SeiyuuService} from "../_services/seiyuu.service";
import {RestService} from "../_services/rest.service";
import {HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../_services/messages.service";
import {RoutingService} from "../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {AnimeService} from "../_services/anime.service";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent, UniqPipe, SpinnerComponent ],
      imports: [FormsModule, HttpClientModule, RouterTestingModule],
      providers: [SeiyuuService, RestService, MessagesService, RoutingService, AnimeService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
