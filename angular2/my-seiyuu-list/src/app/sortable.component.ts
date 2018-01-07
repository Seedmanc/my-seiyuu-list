export abstract class SortableComponent {

  ascending: boolean;
  orderByField: string;

  constructor(defaultSort: string = 'name') {
    this.orderByField = defaultSort;
  }

  sort(field) {
    this.ascending = !this.ascending;
    this.orderByField = field;
  }
}
