import { Pipe, PipeTransform } from '@angular/core';
import { Filter, GroupFilter } from '../../services/definitions';

@Pipe({
  name: 'isFilter'
})
export class IsFilterPipe implements PipeTransform {

  transform(obj: Filter | GroupFilter, args?: any): obj is Filter {
    return obj && !obj.hasOwnProperty( 'filters' );
  }

}
