import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'msl-anime-list',
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css']
})
export class AnimeListComponent implements OnInit {
  orderByField: string = 'title';
  ascending: boolean;

  theSite = 'myanimelist.net';

  commonRoles: any[] = [
    {
      _id: 0,
      pic: '/images/anime/7/6797v.jpg',
      title: 'kemofure',
      character: 'serval',
      main: true
    },
    {
      _id: 1,
      pic: '/images/anime/7/6797v.jpg',
      title: 'kemofure',
      character: 'serval',
      main: false
    },
    {
      _id: 2,
      pic: '/images/anime/7/6797v.jpg',
      title: 'kemofure',
      character: 'kaban',
      main: false
    },
    {
      _id: 3,
      pic: '/images/anime/7/6797v.jpg',
      title: 'idolmaster',
      character: 'kaban',
      main: false
    },
  ]

  constructor() { }

  ngOnInit() {
  }

  onSort(field) {
    this.orderByField = field;
    this.ascending = !this.ascending;
  }

}
