import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingComponent } from './ranking.component';
import {OrderByPipe} from "../orderBy.pipe";
import {SeiyuuService} from "../_services/seiyuu.service";
import {AnimeService} from "../_services/anime.service";
import {RestService} from "../_services/rest.service";
import {HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../_services/messages.service";
import {RoutingService} from "../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {RestServiceMock} from "../_services/tests/rest.service.mock";

describe('RankingComponent', () => {
  let component: RankingComponent;
  let fixture: ComponentFixture<RankingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RankingComponent,OrderByPipe ],
      providers: [SeiyuuService, AnimeService,  {provide: RestService, useClass: RestServiceMock}, MessagesService, RoutingService],
      imports: [HttpClientModule, RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list the seiyuu when toggled', () => {
    component.visible = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#rankingTable td').textContent).toContain('Maeda Konomi');
    fixture.nativeElement.querySelector('.ranking-curtain').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#rankingTable td')).toBeFalsy();
  });
});
