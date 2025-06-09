import { Component, computed, effect, ElementRef, HostBinding, input, model, output, signal, untracked, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchListComponent } from '../search-list/search-list.component';
import { DateCalendarComponent } from '../date-calendar/date-calendar.component';
import { ClickOutDirective } from '../../directives/click-out/click-out.directive';
import { ColumnInfo, ConditionType, DataType, FilterEdit } from '../../services/definitions';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-filter-selector',
  imports: [ ReactiveFormsModule, SearchListComponent, DateCalendarComponent, ClickOutDirective ],
  templateUrl: './filter-selector.component.html',
  styleUrl: './filter-selector.component.css'
})
export class FilterSelectorComponent {

  tableDetails = input.required<ColumnInfo[]>();
  dateFormat = input<string>('dd/MM/yyyy');
  
  inputFilter = input.required<FilterEdit>();

  scrollPos = input<{x: number, y: number}>({x: 0, y: 0});

  inputFilterChange = output<FilterEdit>();

  columnInput = viewChild.required<ElementRef<HTMLDivElement>>( 'columnInput' );
  value1Input = viewChild.required<ElementRef<HTMLDivElement>>( 'value1Input' );
  value2Input = viewChild.required<ElementRef<HTMLDivElement>>( 'value2Input' );
  searchList = viewChild.required( 'searchList', { read: ElementRef } );

  value1Update = signal<number>(0);
  value2Update = signal<number>(0);

  scrollX = computed(() => (this.columnInput().nativeElement.offsetLeft - this.scrollPos().x) + 'px');
  scrollXValue1 = computed(() => (this.value1Update() - this.scrollPos().x) + 'px');
  scrollXValue2 = computed(() => (this.value2Update() - this.scrollPos().x) + 'px');
  scrollY = computed(() => {
    const nextPos = this.columnInput().nativeElement.offsetTop + this.columnInput().nativeElement.offsetHeight - this.scrollPos().y;
    
    if ( nextPos > (document.body.clientHeight * 0.8 * 0.5) ) {
      this.pointUp = false;
      return ( nextPos - this.columnInput().nativeElement.offsetHeight ) + 'px';
    } else {
      this.pointUp = true;
      return nextPos + 'px';
    }
  });

  pointUp: boolean = true;

  conditionList: ConditionType[] = [ '==', '!=', 'in', '!in', '<', '<=', '>', '>=', '><', '!><' ];
  textConditionList: ConditionType[] = [ '==', '!=', 'in', '!in' ];
  conditionListTranslate = { 
    '==': 'exact', 
    '!=': 'not exact', 
    'in': 'includes', 
    '!in': 'not includes', 
    '<': 'less than',
    '<=': 'less than or equals', 
    '>': 'more than',
    '>=': 'more than or equals', 
    '><': 'between', 
    '!><': 'not between',
  };

  filterForm: FormGroup = new FormGroup({
    column: new FormControl(),
    condition: new FormControl(),
    value1: new FormControl( '' ),
    value2: new FormControl( '' ),
  });

  previousCondition!: ConditionType;
  previousValues = { value1: '', value2: '' };

  columnSearch: boolean = false;
  dateCalendar1: boolean = false;
  dateCalendar2: boolean = false;

  constructor() {

    effect(() => {

      this.inputFilter();
      
      untracked(() => {

        const newValues: string[] = this.transformValuesToForm( this.inputFilter().values, this.inputFilter().column.data_type );

        this.filterForm.patchValue({
          column: this.inputFilter().column,
          condition: this.inputFilter().condition,
          value1: newValues[0],
          value2: newValues[1] ? newValues[1] : ''
        });

        this.previousCondition = this.inputFilter().condition;
        this.previousValues.value1 = newValues[0];
        this.previousValues.value2 = newValues[1] ? newValues[1] : '';

      });

    });

  }

  onSubmit() {

    if ( this.filterForm.valid ) {

      if ( ['><', '!><'].includes( this.filterForm.value.condition ) ) {

        this.inputFilterChange.emit({ 
          column: this.filterForm.value.column, 
          condition: this.filterForm.value.condition, 
          values: this.transformValuesToSubmit([ this.filterForm.value.value1, this.filterForm.value.value2 ], this.filterForm.value.column.data_type),
          parent: this.inputFilter().parent,
          id: this.inputFilter().id
        });

      } else {

        this.inputFilterChange.emit({ 
          column: this.filterForm.value.column, 
          condition: this.filterForm.value.condition, 
          values: this.transformValuesToSubmit([ this.filterForm.value.value1 ], this.filterForm.value.column.data_type),
          parent: this.inputFilter().parent,
          id: this.inputFilter().id
        });

      }

    }

  }

  columnToString( value: ColumnInfo ): string {

    return value.column_name;

  }
  
  setColumnSearch( value: boolean ) {

    this.columnSearch = value;

  }

  setDateCalendar1( value: boolean ) {

    this.dateCalendar1 = value;

  }

  setDateCalendar2( value: boolean ) {

    this.dateCalendar2 = value;

  }

  setColumn( value: ColumnInfo ) {

    this.filterForm.patchValue({
      column: value
    });

    this.setColumnSearch( false );

    this.updateFilterValues( this.filterForm.value.column.data_type );

    this.onSubmit();

  }

  setCondition( value: string = this.filterForm.value.condition ) {

    this.filterForm.patchValue({
      condition: value
    });

    this.updateFilterValuesCondition( this.filterForm.value.column.data_type, this.previousCondition, value as ConditionType );

    this.previousCondition = value as ConditionType;

    this.onSubmit();

  }
  
  private updateFilterValues( data_type: DataType ) {

    switch ( data_type ) {

      case 'text':
        if ( !['==', '!=', 'in', '!in'].includes(this.filterForm.value.condition) ) {
          this.filterForm.patchValue({
            condition: '=='
          });
          this.previousCondition = '==';
        }
        this.setFilterValues( '' );
        this.setPreviousValues( '' );
        break;

      case 'number':
      case 'money':
        this.setFilterValues( '0' );
        this.setPreviousValues( '0' );
        break;

      case 'date':
        this.setFilterValues( DateTime.now().startOf('day').toFormat( this.dateFormat() ) );
        this.setPreviousValues( DateTime.now().startOf('day').toFormat( this.dateFormat() ) );
        break;

    }

  }

  private updateFilterValuesCondition( data_type: DataType, previousCondition: ConditionType, condition: ConditionType ) {

    let newValue;
    
    switch ( data_type ) {

      case 'text':
        newValue = '';
        break;

      case 'number':
      case 'money':
        newValue = '0';
        break;

      case 'date':
        newValue = DateTime.now().startOf('day').toFormat( this.dateFormat() );
        break;

    }

    if ( ['><', '!><'].includes( previousCondition ) ) {

      if ( !['><', '!><'].includes( condition ) ) {

        this.filterForm.patchValue({
          value2: newValue
        });

        this.previousValues.value2 = newValue;

      }

    } else {

      if ( ['><', '!><'].includes( condition ) ) {

        this.filterForm.patchValue({
          value2: newValue
        });

        this.previousValues.value2 = newValue;

      }

    }

  }


  private setFilterValues( value: string ) {

    this.filterForm.patchValue({
      value1: value,
      value2: value
    });

  }

  private setPreviousValues( value: string ) {

    this.previousValues.value1 = value;
    this.previousValues.value2 = value;

  }

  setPlaceholder( datatype: DataType = this.filterForm.value.column.data_type ): string {

    switch ( datatype ) {

      case 'date':
        return this.dateFormat().toUpperCase();

      default:
        return '';
      
    }

  }
  
  setValue( valueId: 'value1' | 'value2', value: string = this.filterForm.value[valueId] ) {
    
    switch ( this.filterForm.value.column.data_type ) {
      
      case 'date':
        
        if ( DateTime.fromFormat( value, this.dateFormat(), { zone: 'local' } ).isValid ) {
          
          this.filterForm.controls[valueId].setValue( value );
          this.previousValues[valueId] = value;

        } else {

          this.filterForm.controls[valueId].setValue( this.previousValues[valueId] );

        }
        break;

      case 'number':
      case 'money':
        if ( Number( value ) ) {

          this.filterForm.controls[valueId].setValue( Number( value ) + '' );
          this.previousValues[valueId] = Number( value ) + '';

        } else {

          this.filterForm.controls[valueId].setValue( this.previousValues[valueId] );

        }
        break;

    }

    this.onSubmit();

  }

  transformValuesToForm( inputValues: string[], dataType: DataType ): string[] {

    let newInputValues: string[] = [];

    for ( const value of inputValues ) {

      switch ( dataType ) {

        case 'date':

          newInputValues = [ ...newInputValues, DateTime.fromISO( value, {setZone: true}).setZone( 'local' ).toFormat( this.dateFormat() ) ];
          break;

        default:
          newInputValues = [ ...newInputValues, value ];

      }

    }

    return newInputValues;

  }

  transformValuesToSubmit( outputValues: string[], dataType: DataType ): string[] {

    let newOutputValues: string[] = [];

    for ( const value of outputValues ) {

      switch ( dataType ) {

        case 'date':

          newOutputValues = [ ...newOutputValues, DateTime.fromFormat( value, this.dateFormat()).startOf('day').setZone( 'utc' ).toISO({ suppressMilliseconds: true })!.replace('Z', '+00:00') ];
          break;

        default:
          newOutputValues = [ ...newOutputValues, value ];

      }

    }

    return newOutputValues;

  }

  updateValue1Input() {
    this.value1Update.set( this.value1Input().nativeElement.offsetLeft );
    this.setDateCalendar1(true);
  }

  updateValue2Input() {
    this.value2Update.set( this.value2Input().nativeElement.offsetLeft );
    this.setDateCalendar2(true);
  }

}
