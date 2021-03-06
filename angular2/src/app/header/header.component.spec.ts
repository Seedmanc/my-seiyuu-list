import {async, ComponentFixture, discardPeriodicTasks, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import {FormsModule} from "@angular/forms";
import {UniqPipe} from "../_misc/uniq.pipe";
import {SpinnerComponent} from "../spinner/spinner.component";
import {SeiyuuService} from "../_services/seiyuu.service";
import {RestService} from "../_services/rest.service";
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
      imports: [FormsModule, RouterTestingModule],
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
  beforeAll(() => localStorage.clear());

  it('should list names',() => {
    let x;
    component.name$.subscribe(r => x=r);
    expect(x).toBeTruthy()
  });

  it('should display messages', inject([MessagesService], (msgSvc: MessagesService) => {
    msgSvc.message$.next({data:'test6'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#status').textContent).toContain('test6');
    msgSvc.message$.next({data:'error', isError: true});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#status').textContent).toContain('error');
    expect(fixture.nativeElement.querySelector('#status').classList).toContain('error');
   }));

  it('should emit search query on input and change', fakeAsync( inject([SeiyuuService], (seiSvc: SeiyuuService) => {
    let x;
    fixture.detectChanges();

    seiSvc.search$.subscribe(r => x=r);
    component.searchInput.nativeElement.value = ' Test ';
    component.searchInput.nativeElement.dispatchEvent(new Event('change'));
    expect(x).toBe('test');
    component.searchInput.nativeElement.value = 'Maeda Konomi';
    component.searchInput.nativeElement.dispatchEvent(new Event('input'));
    tick(500);
    expect(x).toBe('maeda konomi');
    discardPeriodicTasks()
  }))
 );

  it('should detect selected seiyuu', fakeAsync( () => {
    let x;

    component.searchInput.nativeElement.value = 'Maeda Konomi';
    component.searchInput.nativeElement.dispatchEvent(new Event('input'));
    tick(500);
    expect(component.isSelected('Maeda Konomi')).toBeTruthy();
  })
 );

  it('should save hint visibility to localstorage', () => {
    expect(component.hideTry).toBeFalsy();
    component.hide();
    expect(component.hideTry).toBeTruthy();
  });

  it('should load hint visibility from localstorage', () => {
    expect(component.hideTry).toBeTruthy();
  });
});
