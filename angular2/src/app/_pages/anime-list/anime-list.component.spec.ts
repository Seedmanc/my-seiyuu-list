import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import { AnimeListComponent } from './anime-list.component';
import {OrderByPipe} from "../../_misc/orderBy.pipe";
import {RoutingService} from "../../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {RoutingServiceMock} from "../../_services/tests/routing.service.mock";
import { FormsModule } from '@angular/forms';
import {AnimeService} from "../../_services/anime.service";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {MessagesService} from "../../_services/messages.service";
import {SeiyuuService} from "../../_services/seiyuu.service";
import {SortLinkComponent} from "../../sort-link/sort-link.component";
import {SorterService} from "../../_services/sorter.service";
import {ToggleChartComponent} from "../../toggle-chart/toggle-chart.component";
import {AnimeChartComponent} from "../../anime-chart/anime-chart.component";
import {SpinnerComponent} from "../../spinner/spinner.component";

describe('AnimeListComponent', () => {
  let component: AnimeListComponent;
  let fixture: ComponentFixture<AnimeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimeListComponent, OrderByPipe, SortLinkComponent, AnimeChartComponent, ToggleChartComponent, SpinnerComponent],
      providers: [SorterService, {provide: RoutingService, useClass: RoutingServiceMock}, AnimeService, MessagesService, SeiyuuService],
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should store mainOnly switch to localStorage', inject([AnimeService],
    (service: AnimeService) => {
      let y;
      service.mainOnly$.subscribe(data => y = data);
      let x = localStorage.mainOnly == 'true';
      expect(component.mainOnly).toBe(x);
      expect(y).toBe(x);
      component.onMainOnlyChange(true);
      expect(component.mainOnly).toBe(true);
      expect(y).toBe(true);

      component.onMainOnlyChange(false);
    })
  );

  it('should keep mainOnly switch between sessions', inject([AnimeService],
    (service: AnimeService) => {
      let y;
      service.mainOnly$.subscribe(data => y = data);
      let x = localStorage.mainOnly == 'true';
      expect(component.mainOnly).toBe(false);
      expect(y).toBe(false);
    })
  );

  it('should report results', inject([AnimeService, MessagesService, SeiyuuService],
    (service: AnimeService, msgSvc: MessagesService) => {
      let spy = spyOn(msgSvc, 'results');
      let l = [];
      service.displayAnime$.next(l);

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0]).toBe(l);
      expect(spy.calls.mostRecent().args[1].toString()).toBe('anime => `${anime.length} [${entity}]`');
      expect(spy.calls.mostRecent().args[2]).toBe(true);
    })
  );

  it('shouldn\'t report when chart is enabled', inject([AnimeService, MessagesService],
    (service: AnimeService, msgSvc: MessagesService) => {
      let spy = spyOn(msgSvc, 'results');
      service.toggleChart$.next(true);
      service.displayAnime$.next([]);

      expect(spy).not.toHaveBeenCalled();
    })
  );
});
