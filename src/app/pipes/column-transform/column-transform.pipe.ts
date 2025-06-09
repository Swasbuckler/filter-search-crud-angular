import { Pipe, PipeTransform } from '@angular/core';
import { DataType } from '../../services/definitions';
import { DateTime } from 'luxon';

@Pipe({
  name: 'columnTransform'
})
export class ColumnTransformPipe implements PipeTransform {

  transform(value: any, dateFormat: string, moneyFormat: string, dataType: DataType): string {
    switch (dataType) {

      case 'text':
      case 'number':

        return value;

      case 'money':

        return moneyFormat + value;

      case 'date':

        return DateTime.fromISO( value, {setZone: true}).setZone( 'local' ).toFormat( dateFormat );

    }
  }

}
