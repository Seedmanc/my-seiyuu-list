import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimeListComponent } from './anime-list.component';
import {OrderByPipe} from "../../_misc/orderBy.pipe";
import {RoutingService} from "../../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {RoutingServiceMock} from "../../_services/tests/routing.service.mock";
import { FormsModule } from '@angular/forms';
import {AnimeService} from "../../_services/anime.service";
import {RestService} from "../../_services/rest.service";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {MessagesService} from "../../_services/messages.service";
import {SeiyuuService} from "../../_services/seiyuu.service";
import {SortLinkComponent} from "../../sort-link/sort-link.component";
import {SorterService} from "../../_services/sorter.service";

xdescribe('AnimeListComponent', () => {
  let component: AnimeListComponent;
  let fixture: ComponentFixture<AnimeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimeListComponent, OrderByPipe, SortLinkComponent],
      providers: [SorterService, {provide: RoutingService, useClass: RoutingServiceMock}, AnimeService, RestService, MessagesService, SeiyuuService],
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
