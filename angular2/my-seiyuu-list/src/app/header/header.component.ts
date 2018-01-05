import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'msl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  searchQuery: string;
  status: string = 'status';

  vanames = {
    test: {id: '0'},
    test2: {id: '1'},
  }

  private objectKeys = Object.keys;

  constructor() { }

  ngOnInit() {
  }

  disable() {
    return false;
  }

  inputChange(input) {
  }

}
