import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnCase'
})
export class ColumnCasePipe implements PipeTransform {

  transform( value: string ): string {
    return value.toLowerCase().replace('_', ' ');
  }

}
