import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  pure: false
})
export class OrderByPipe implements PipeTransform {

  transform(value: any[], field: string, asc?: boolean): any[] {
    return (value||[]).sort((e1,e2) => {
      let result = 0;

      if (e1.main !== undefined)
        result = e1.main > e2.main ? 1 : 0;

      result = result || e1[field] > e2[field] ? 1 : -1;

      return result * (asc ? -1:1);
    });
  }

}
