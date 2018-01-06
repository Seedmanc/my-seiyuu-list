import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'msl-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  public visible: boolean;

  ascending: boolean;
  orderByField: string = 'name';

  rankedSeiyuu: any[] = [
    {
      name: 'Misawa Sachika',
      hits: 1,
      count: 10,
      accessed: 1515170795197
    },
    {
      name: 'Chihara Minori',
      hits: 10,
      count: 11,
      accessed: +(new Date())
    },
    {
      name: 'Misawa Sachika',
      hits: 10,
      count: 12,
      accessed: 1515170795197
    },
    {
      name: 'Imai Asami',
      hits: 10,
      count: 13,
      accessed: +(new Date())
    },
    {
      name: 'Imai Asami',
      hits: 20,
      count: 14,
      accessed: +(new Date())
    },
    {
      name: 'Imai Asami',
      hits: 20,
      count: 15,
      accessed: 1515180795197
    },
  ];

  constructor() { }

  ngOnInit() {
  }

  close(event) {
    this.visible = event.target !== event.currentTarget;
  }

  sort(field) {
    this.ascending = !this.ascending;
    this.orderByField = field;
  }

}
