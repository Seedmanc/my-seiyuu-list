import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import {RankingComponent} from "../ranking/ranking.component";
import {OrderByPipe} from "../_misc/orderBy.pipe";
import {SeiyuuService} from "../_services/seiyuu.service";
import {RestService} from "../_services/rest.service";
import { HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../_services/messages.service";
import {RoutingService} from "../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {RestServiceMock} from "../_services/tests/rest.service.mock";
import {RoutingServiceMock} from "../_services/tests/routing.service.mock";
import {SorterService} from "../_services/sorter.service";
import {SortLinkComponent} from "../sort-link/sort-link.component";

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterComponent, RankingComponent, OrderByPipe, SortLinkComponent],
      providers: [SorterService,
        SeiyuuService, {provide: RestService, useClass: RestServiceMock}, MessagesService,
        {provide: RoutingService, useClass: RoutingServiceMock}
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

  it('should load disqus', () => {    //TODO can break testing
    component.toggleDisqus();
    expect(fixture.nativeElement.querySelector('script[src="//my-seiyuu-list.disqus.com/embed.js"]')).toBeTruthy();
  });
});
