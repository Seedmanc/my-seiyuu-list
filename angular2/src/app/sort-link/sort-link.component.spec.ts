import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';

import { SortLinkComponent } from './sort-link.component';
import {SorterService} from "../_services/sorter.service";

describe('SortLinkComponent', () => {
  let component: SortLinkComponent;
  let fixture: ComponentFixture<SortLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [SorterService],
      declarations: [ SortLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortLinkComponent);
    component = fixture.componentInstance;
    component.default = '';
    component.content.nativeElement.textContent = 'test2';
    fixture.detectChanges();
  });

  it('should work with default',
    inject([SorterService], (svc: SorterService)=> {
      expect(svc.orderByField).toEqual('test2');
      let spy = spyOn(svc, 'sort');
      component.sort();
      expect(spy).toHaveBeenCalledWith('test2');
      expect(svc.fixed).toBeFalsy();
    })
  )
});

describe('SortLinkComponent', () => {
  let component: SortLinkComponent;
  let fixture: ComponentFixture<SortLinkComponent>;
  let x;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [SorterService],
      declarations: [ SortLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortLinkComponent);
    component = fixture.componentInstance;
    component.fixed = '';
    component.content.nativeElement.textContent = 'test3';
    fixture.detectChanges();
    component.onSort.subscribe(_ => x= _);
  });

  it('should work with fixed',
    inject([SorterService], (svc: SorterService)=> {
      expect(svc.orderByField).toBeFalsy();
      let spy = spyOn(svc, 'sort');
      component.sort();
      expect(spy).not.toHaveBeenCalled();
      expect(svc.fixed).toBe('test3');
      expect(x).toBe(svc.ascending);
    })
  )
});
