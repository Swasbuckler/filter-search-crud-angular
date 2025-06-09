import { Component, effect, input, model, output, untracked } from '@angular/core';
import { KeyValue, KeyValuePipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';
import { ColumnInfo, SortType } from '../../services/definitions';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCaretDown, faCaretRight, faCaretUp, faPencil, faRotateRight, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ColumnCasePipe } from '../../pipes/column-case/column-case.pipe';
import { ColumnTransformPipe } from '../../pipes/column-transform/column-transform.pipe';

@Component({
  selector: 'app-result-table',
  imports: [ NgTemplateOutlet, PaginationComponent, KeyValuePipe, ColumnCasePipe, TitleCasePipe, ColumnTransformPipe, FontAwesomeModule ],
  templateUrl: './result-table.component.html',
  styleUrl: './result-table.component.css'
})
export class ResultTableComponent {

  loading = input.required<boolean>();
  failedToLoad = input.required<boolean>();

  tableDetails = input.required<ColumnInfo[]>();
  tableData = input.required<any[]>();
  groupby = input.required<string[]>();

  dateFormat = input<string>('dd/MM/yyyy');
  moneyFormat = input<string>('$');

  rowCount = input.required<number>();

  uniqueColumn = input.required<string>();

  sort = model.required<SortType>();

  limit = model.required<number>();
  offset = model.required<number>();

  updateRow = output<number>();
  deleteRow = output<number>();

  columnWidths: string[] = [];
  focusData: any[] | Record<string, any> = [];

  buttonData: Record<string, any> = {};

  faCaretDown = faCaretDown;
  faCaretUp = faCaretUp;
  faCaretRight = faCaretRight;
  faPencil = faPencil;
  faTrashCan = faTrashCan;
  faRotateRight = faRotateRight;

  constructor() {

    effect(() => {

      const tableData = this.tableData();

      untracked(() => {

        if ( this.groupby().length > 0 ) {
          
          this.focusData = tableData[0];

        } else {
          
          this.focusData = tableData;

        }

        this.buttonData = this.extractButtonData( this.focusData, this.groupby(), 0 );

      });

    });

  }

  keepOrder( x: KeyValue<string, any>, y: KeyValue<string, any> ): number {
    
    return 0;
  }

  customTrackBy(index: number, key: string): string {
    return `${index}-${key}`;
  }

  extractButtonData( tableData: Record<string, any>, groupList: string[], depth: number ): Record<string, any> {

    let buttonData: Record<string, any> = {};

    if ( depth < groupList.length ) {

      for ( const key in tableData ) {

        buttonData[key] = { button: false, children: this.extractButtonData( tableData[key], groupList, depth + 1 ) };

      }

    }

    return buttonData;

  }

  updateTableRow( id: number ) {

    this.updateRow.emit( id );

  }

  deleteTableRow( id: number ) {

    this.deleteRow.emit( id );

  }

  updateSort( sort: SortType, column: string ) {

    if ( sort.column_name === column ) {

      this.sort.update(() => ({ column_name: column, order: (sort.order === 'ASC' ? 'DESC' : 'ASC') }) );

    } else {

      this.sort.update(() => ({ column_name: column, order: 'ASC' }) );

    }

  }

  reload() {

    window.location.reload();

  }

}
