import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
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

describe('AnimeListComponent', () => {
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

  it('should report results', inject([AnimeService, MessagesService],
    (service: AnimeService, msgSvc: MessagesService) => {
      let spy = spyOn(msgSvc, 'results');

      service.displayAnime$.next([[], 0]);
      expect(spy).toHaveBeenCalledWith(0, 0, 'anime');
      spy.calls.reset();

      service.displayAnime$.next([['derp'], 0]);
      expect(spy).toHaveBeenCalledWith('1 anime', 0, 'anime');
      spy.calls.reset();

      service.displayAnime$.next([['derp'], 1]);
      expect(spy).toHaveBeenCalledWith('1 anime', 1, 'anime');
      spy.calls.reset();

      service.displayAnime$.next([['derp', 'hurr'], 2]);
      expect(spy).toHaveBeenCalledWith('2 shared anime', 2, 'shared anime');
    })
  );
});
