import {async, ComponentFixture, discardPeriodicTasks, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import {FormsModule} from "@angular/forms";
import {UniqPipe} from "../_misc/uniq.pipe";
import {SpinnerComponent} from "../spinner/spinner.component";
import {SeiyuuService} from "../_services/seiyuu.service";
import {RestService} from "../_services/rest.service";
import {HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../_services/messages.service";
import {RoutingService} from "../_services/routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {AnimeService} from "../_services/anime.service";
import {RestServiceMock} from "../_services/tests/rest.service.mock";
import {RoutingServiceMock} from "../_services/tests/routing.service.mock";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent, UniqPipe, SpinnerComponent ],
      imports: [FormsModule, HttpClientModule, RouterTestingModule],
      providers: [SeiyuuService,  {provide: RestService, useClass: RestServiceMock}, MessagesService,
        {provide: RoutingService, useClass: RoutingServiceMock}, AnimeService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list names',() => {
    let x;
    component.name$.subscribe(r => x=r);
    expect(x).toBeTruthy()
  });

  it('should display messages', inject([MessagesService], (msgSvc: MessagesService) => {
    msgSvc.message$.next({data:'test'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#status').textContent).toContain('test');
    msgSvc.message$.next({data:'error', isError: true});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#status').textContent).toContain('error');
    expect(fixture.nativeElement.querySelector('#status').classList).toContain('error');
   }));

  it('should emit search query on input and change', fakeAsync( ()=> {
    let x;
    fixture.detectChanges();
    component.search$.subscribe(r => x=r);
    component.searchInput.nativeElement.value = ' Test ';
    component.searchInput.nativeElement.dispatchEvent(new Event('change'));
    expect(x).toBe('test');
    component.searchInput.nativeElement.value = 'Maeda Konomi';
    component.searchInput.nativeElement.dispatchEvent(new Event('input'));
    tick(500);
    expect(x).toBe('maeda konomi');
    discardPeriodicTasks()
  }));
});
