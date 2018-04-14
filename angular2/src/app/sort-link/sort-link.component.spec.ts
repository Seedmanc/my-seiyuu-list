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
    component.content.nativeElement.textContent = 'test';
    fixture.detectChanges();
  });

  it('should work',
    inject([SorterService], (svc: SorterService)=> {
      expect(svc.orderByField).toEqual('test');
      let spy = spyOn(svc, 'sort');
      component.sort();
      expect(spy).toHaveBeenCalledWith('test');
    })
  )
});
