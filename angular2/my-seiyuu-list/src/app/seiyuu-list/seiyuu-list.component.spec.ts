import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeiyuuListComponent } from './seiyuu-list.component';

describe('SeiyuuListComponent', () => {
  let component: SeiyuuListComponent;
  let fixture: ComponentFixture<SeiyuuListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeiyuuListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeiyuuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
