import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uniq'
})
export class UniqPipe implements PipeTransform {

  transform(value: any[]): any[] {
    return (value||[]).filter((el,i,arr) => arr.indexOf(el) == i);
  }

}
