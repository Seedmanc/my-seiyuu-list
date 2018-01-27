import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import {RankingComponent} from "../ranking/ranking.component";
import {OrderByPipe} from "../orderBy.pipe";
import {SeiyuuService} from "../_services/seiyuu.service";
import {RestService} from "../_services/rest.service";
import { HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../_services/messages.service";
import {RoutingService} from "../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {AnimeService} from "../_services/anime.service";

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterComponent, RankingComponent, OrderByPipe],
      providers: [
        SeiyuuService, RestService, MessagesService, RoutingService, AnimeService
      ],
      imports:[HttpClientModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load disqus', () => {
    component.toggleDisqus();
    expect(fixture.nativeElement.querySelector('script[src="//my-seiyuu-list.disqus.com/embed.js"]')).toBeTruthy();
  });
});
