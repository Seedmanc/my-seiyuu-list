import { Injectable } from '@angular/core';

@Injectable()
export class SorterService {
  public ascending: boolean = true;
  public orderByField: string;

  constructor() { }

  public sort(field) {
    this.ascending = this.orderByField != field != !this.ascending;
    this.orderByField = field;
  }
}
