import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeChartComponent } from './anime-chart.component';

xdescribe('AnimeChartComponent', () => {
  let component: AnimeChartComponent;
  let fixture: ComponentFixture<AnimeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimeChartComponent ]
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
});
