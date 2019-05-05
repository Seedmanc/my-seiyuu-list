import {async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import {AnimeService} from "../_services/anime.service";
import {ToggleChartComponent} from "./toggle-chart.component";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MessagesService} from "../_services/messages.service";
import {RouterTestingModule} from "@angular/router/testing";

describe('ToggleChartComponent', () => {
  let component: ToggleChartComponent;
  let fixture: ComponentFixture<ToggleChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleChartComponent ],
      providers:[ AnimeService, MessagesService],
      imports:[ HttpClientTestingModule, RouterTestingModule ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit to anime svc on toggle',
    inject([AnimeService], (svc: AnimeService)=> {
      let x ;
      svc.toggleChart$.subscribe(_=>x=_);
      component.toggle.nativeElement.checked = true;
      component.toggle.nativeElement.dispatchEvent(new Event('change'));
      expect(x).toBeTruthy();
    })
  );

  it('should toggle on anime svc emit',
    inject([AnimeService], (svc: AnimeService)=> {
      component.toggle.nativeElement.checked = false;
      svc.toggleChart$.next(true);
      expect(component.toggle.nativeElement.checked).toBeTruthy();
    })
  );

});
