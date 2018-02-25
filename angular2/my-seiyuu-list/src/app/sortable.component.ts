export abstract class SortableComponent {

  protected ascending: boolean;
  protected orderByField: string;

  constructor(defaultSort: string = 'name') {
    this.orderByField = defaultSort;
  }

  protected sort(field) {
    this.ascending = !this.ascending;
    this.orderByField = field;
  }
}
