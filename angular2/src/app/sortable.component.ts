export abstract class SortableComponent {

  public ascending: boolean;
  public orderByField: string;

  constructor(defaultSort: string = 'name') {
    this.orderByField = defaultSort;
  }

  public sort(field) {
    this.ascending = !this.ascending;
    this.orderByField = field;
  }
}
