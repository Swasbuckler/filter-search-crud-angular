import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listDisplay'
})
export class ListDisplayPipe implements PipeTransform {

  transform(value: string[], arg: string): string {
    return value.join( arg );
  }

}
