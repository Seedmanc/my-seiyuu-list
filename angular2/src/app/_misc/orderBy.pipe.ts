import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(value: any[], fields: string[], asc?: boolean): any[] {
    return (value||[]).sort((e1, e2) => {
      let dif = asc ? 1:-1;

      return fields.reduce((prev, curr) =>
          e1[curr] > e2[curr] ?
            dif :
            e1[curr] == e2[curr] ?
              prev :
              -dif,
        0);
    });
  }

}
