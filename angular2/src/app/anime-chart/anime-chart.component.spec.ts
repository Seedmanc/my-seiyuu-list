import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { AnimeChartComponent } from './anime-chart.component';
import {AnimeService} from "../_services/anime.service";
import {MessagesService} from "../_services/messages.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {Anime} from "../_models/anime.model";
import {SpinnerComponent} from "../spinner/spinner.component";

describe('AnimeChartComponent', () => {
  let component: AnimeChartComponent;
  let fixture: ComponentFixture<AnimeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimeChartComponent, SpinnerComponent],
      providers: [ AnimeService, MessagesService],
      imports: [RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should report results', inject([AnimeService, MessagesService],
    (service: AnimeService, msgSvc: MessagesService) => {
      let spy2 = spyOn(msgSvc, 'status');
      service.displayChart$.next([[],[[<Anime>{}],[]]]);

      expect(spy2).toHaveBeenCalledWith('highlight a seiyuu to view their characters on anime hover');
      service.displayChart$.next([[],[[],[]]]);
      expect(spy2).toHaveBeenCalled();
      expect(spy2.calls.mostRecent().args[0]).toBe('no shared anime found');
    })
  );
});
