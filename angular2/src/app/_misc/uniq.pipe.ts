import { Pipe, PipeTransform } from '@angular/core';
import {Utils} from "../_services/utils";

@Pipe({
  name: 'uniq'
})
export class UniqPipe implements PipeTransform {

  transform(value: any[], prop?: string): any[] {
    return Utils.unique(value || [], prop);
  }

}
