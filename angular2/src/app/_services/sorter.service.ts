import { Injectable } from '@angular/core';

@Injectable()
export class SorterService {
  ascending: boolean = true;
  orderByField: string;

  constructor() { }

  public sort(field) {
    this.ascending = this.orderByField != field != !this.ascending;
    this.orderByField = field;
  }
}
