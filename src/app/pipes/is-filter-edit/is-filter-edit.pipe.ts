import { Pipe, PipeTransform } from '@angular/core';
import { FilterEdit, GroupFilterEdit } from '../../services/definitions';

@Pipe({
  name: 'isFilterEdit'
})
export class IsFilterEditPipe implements PipeTransform {

  transform(obj: FilterEdit | GroupFilterEdit, args?: any): obj is FilterEdit {
      return obj && !obj.hasOwnProperty( 'filters' );
    }

}
