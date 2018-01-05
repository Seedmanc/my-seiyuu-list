import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeiyuuPanelComponent } from './seiyuu-panel.component';

describe('SeiyuuPanelComponent', () => {
  let component: SeiyuuPanelComponent;
  let fixture: ComponentFixture<SeiyuuPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeiyuuPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeiyuuPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
