import { Component, effect, input, model, output, signal, untracked } from '@angular/core';
import { ColumnInfo, FilterEdit, GroupFilterEdit, OperatorType } from '../../services/definitions';
import { NgTemplateOutlet } from '@angular/common';
import { FilterSelectorComponent } from '../filter-selector/filter-selector.component';
import { IsFilterEditPipe } from '../../pipes/is-filter-edit/is-filter-edit.pipe';
import { DateTime } from 'luxon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLayerGroup, faPlus, faTrashCan, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-filter-popup',
  imports: [ NgTemplateOutlet, FilterSelectorComponent, IsFilterEditPipe, FontAwesomeModule ],
  templateUrl: './filter-popup.component.html',
  styleUrl: './filter-popup.component.css'
})
export class FilterPopupComponent {

  tableDetails = input.required<ColumnInfo[]>();
  dateFormat = input<string>('dd/MM/yyyy');

  inputFilter = input.required<FilterEdit | GroupFilterEdit>();

  uniqueIndex = model.required<number>();
  
  exit = output<boolean>();

  scrollPos = signal<{x: number, y: number}>({x: 0, y: 0});

  newFilter: GroupFilterEdit = {
    filters: [],
    operator: 'AND',
    parent: undefined,
    id: '0',
  }

  faX = faX;
  faPlus = faPlus;
  faLayerGroup = faLayerGroup;
  faTrashCan = faTrashCan;

  constructor() {

    effect(() => {

      const inputFilter = this.inputFilter();

      untracked(() => {

        if ( this.isFilter( inputFilter ) ) {

          this.newFilter.filters = [{ 
            column: inputFilter.column,
            condition: inputFilter.condition,
            values: inputFilter.values,
            parent: this.newFilter,
            id: inputFilter.id
          }];

        } else {

          const { newGroupFilter, newUniqueIndex } = this.getGroupFilterEdit( inputFilter, undefined, this.getNextUniqueIndex() );

          this.uniqueIndex.update(() => newUniqueIndex);

          this.newFilter = newGroupFilter;

        }

      });

    });

  }

  isFilter( obj: (FilterEdit | GroupFilterEdit) ): obj is FilterEdit {
    return obj && !obj.hasOwnProperty( 'filters' );
  }

  getGroupFilterEdit( groupFilter: GroupFilterEdit, parent: GroupFilterEdit | undefined, uniqueIndex: number ): { newGroupFilter: GroupFilterEdit, newUniqueIndex: number } {

    let nextUniqueIndex = uniqueIndex;
    const groupFilterEdit: GroupFilterEdit = { filters: [], operator: groupFilter.operator, parent: parent, id: nextUniqueIndex + '' };

    for ( const filter of groupFilter.filters ) {

      if ( this.isFilter( filter ) ) {

        const nextFilter = this.getFilterEdit( filter, groupFilterEdit, ++nextUniqueIndex );

        groupFilterEdit.filters = [ ...groupFilterEdit.filters, nextFilter ];

      } else {

        const { newGroupFilter, newUniqueIndex }  = this.getGroupFilterEdit( filter, groupFilterEdit, ++nextUniqueIndex );

        groupFilterEdit.filters = [ ...groupFilterEdit.filters, newGroupFilter ];

        nextUniqueIndex = newUniqueIndex;

      }

    }

    return { newGroupFilter: groupFilterEdit, newUniqueIndex: nextUniqueIndex };

  }

  getFilterEdit( filter: FilterEdit, parent: GroupFilterEdit, uniqueIndex: number ): FilterEdit {

    return {
      column: filter.column,
      condition: filter.condition,
      values: filter.values,
      parent: parent,
      id: uniqueIndex + ''
    }

  }

  getNextUniqueIndex(): number {

    this.uniqueIndex.update((uniqueIndex) => uniqueIndex + 1);
    return this.uniqueIndex();

  }

  addFilter( parentFilter: GroupFilterEdit, index: number = parentFilter.filters.length - 1 ) {

    const uniqueIndex = this.getNextUniqueIndex();

    const newFilter: FilterEdit = this.defaultFilter( parentFilter, uniqueIndex );

    this.addNewFilter( newFilter, parentFilter, index );

  }
  
  addGroupFilter( parentFilter: GroupFilterEdit, index: number = parentFilter.filters.length - 1 ) {

    let uniqueIndex = this.getNextUniqueIndex();

    const newGroupFilter: GroupFilterEdit = {
      filters: [],
      operator: 'AND',
      parent: parentFilter,
      id: uniqueIndex + ''
    };

    for ( let i = 0; i < 2; i++ ) {

      uniqueIndex = this.getNextUniqueIndex();

      newGroupFilter.filters = [ ...newGroupFilter.filters, this.defaultFilter( newGroupFilter, uniqueIndex ) ];

    }

    this.addNewFilter( newGroupFilter, parentFilter, index );

  }

  private addNewFilter( newFilter: FilterEdit | GroupFilterEdit, parentFilter: GroupFilterEdit, index: number ) {

    parentFilter.filters = [ 
      ...parentFilter.filters.slice(0, index + 1),
      newFilter,
      ...parentFilter.filters.slice(index + 1)
    ];

  }

  updateFilter( filter: FilterEdit, index: number ) {

    const parentFilter = filter.parent;

    parentFilter.filters = [
      ...parentFilter.filters.slice(0, index),
      filter,
      ...parentFilter.filters.slice(index + 1)
    ];

  }

  deleteFilter( filter: FilterEdit | GroupFilterEdit, index: number ) {

    const parentFilter = filter.parent;
    
    if ( parentFilter ) {

      parentFilter.filters = [ 
        ...parentFilter.filters.slice(0, index),
        ...parentFilter.filters.slice(index + 1)
      ];

      const parentOfParent = parentFilter.parent;

      if ( parentFilter.filters.length < 2 && parentOfParent ) {

        for ( let i = 0; i < parentOfParent.filters.length; i++ ) {

          if ( parentOfParent.filters[i].id === parentFilter.id ) {

            const newFilter = parentFilter.filters[0];
            newFilter.parent = parentOfParent;

            parentOfParent.filters = [
              ...parentOfParent.filters.slice(0, i),
              newFilter,
              ...parentOfParent.filters.slice(i + 1)
            ];

            break;

          }

        }

      }

    }

  }

  private defaultFilter( parent: GroupFilterEdit, index: number ): FilterEdit {

    const newFilter: FilterEdit = { 
      column: this.tableDetails()[0], 
      condition: '==', 
      values: [ '' ], 
      parent: parent,
      id: index + '',
    };

    switch ( this.tableDetails()[0].data_type ) {
    
      case 'text':
        newFilter.values = [ '' ];
        break;
    
      case 'number':
      case 'money':
        newFilter.values = [ '0' ];
        break;
    
      case 'date':
        newFilter.values = [ DateTime.now().toFormat( this.dateFormat() ) ];
        break;
    
    }

    return newFilter;

  }

  changeOperator( groupFilter: GroupFilterEdit, event: EventTarget ) {

    groupFilter.operator = (event as HTMLSelectElement).value as OperatorType;

  }

  onSave() {

    const parentFilter = this.inputFilter().parent;

    if ( parentFilter ) {

      let newFilter: FilterEdit | GroupFilterEdit = this.newFilter;

      let uniqueIndex = this.getNextUniqueIndex();
      
      switch ( this.newFilter.filters.length ) {

        case 0:
          
          for ( let i = 0; i < parentFilter.filters.length; i++ ) {

            if ( parentFilter.filters[i].id === this.inputFilter().id ) {

              this.deleteFilter( parentFilter.filters[i], i );

              this.onExit( true );
              return;

            }

          }
          break;

        case 1:

          newFilter = {
            column: (this.newFilter.filters[0] as FilterEdit).column,
            condition: (this.newFilter.filters[0] as FilterEdit).condition,
            values: (this.newFilter.filters[0] as FilterEdit).values,
            parent: parentFilter,
            id: uniqueIndex + ''
          }
          break;

        default:
          this.newFilter.parent = parentFilter;
          this.newFilter.id = uniqueIndex + '';
          newFilter = this.newFilter;

      }

      for ( let i = 0; i < parentFilter.filters.length; i++ ) {

        if ( parentFilter.filters[i].id === this.inputFilter().id ) {

          parentFilter.filters = [
            ...parentFilter.filters.slice(0, i),
            newFilter,
            ...parentFilter.filters.slice(i + 1)
          ];

          this.onExit( true );
          return;

        }

      }

      parentFilter.filters = [
        ...parentFilter.filters,
        newFilter
      ];

    } else {

      for ( let i = 0; i < this.newFilter.filters.length; i++ ) {

        this.newFilter.filters[i].parent = (this.inputFilter() as GroupFilterEdit);

      }

      (this.inputFilter() as GroupFilterEdit).filters = this.newFilter.filters;
      (this.inputFilter() as GroupFilterEdit).operator = this.newFilter.operator;

    }

    this.onExit( true );

  }

  onExit( value: boolean ) {

    this.exit.emit( value );

  }

  setScrollPos( value: { x: number, y: number } ) {

    this.scrollPos.set( value );

  }

}
