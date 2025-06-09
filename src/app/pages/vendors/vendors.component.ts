import { Component, computed, effect, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { DataServiceService } from '../../services/data-service.service';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { SearchListComponent } from '../../components/search-list/search-list.component';
import { ResultTableComponent } from '../../components/result-table/result-table.component';
import { FilterPopupComponent } from '../../components/filter-popup/filter-popup.component';
import { ClickOutDirective } from '../../directives/click-out/click-out.directive';
import { ColumnCasePipe } from '../../pipes/column-case/column-case.pipe';
import { ColumnInfo, Filter, FilterEdit, GroupFilter, GroupFilterEdit, OperatorType, SortType } from '../../services/definitions';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp, faPencil, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';
import { ConfirmationPopupComponent } from "../../components/confirmation-popup/confirmation-popup.component";
import { ErrorPopupComponent } from '../../components/error-popup/error-popup.component';

@Component({
  selector: 'app-vendors',
  imports: [RouterLink, SearchBarComponent, SearchListComponent, ResultTableComponent, FilterPopupComponent, ConfirmationPopupComponent, ErrorPopupComponent, ClickOutDirective, ColumnCasePipe, TitleCasePipe, FontAwesomeModule ],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.css'
})
export class VendorsComponent implements OnInit {

  groupFilter: GroupFilterEdit = { filters: [], operator: 'AND', parent: undefined, id: '0' };
  groupFilterData: GroupFilter = { filters: [], operator: 'AND' };

  tableDetails = signal<ColumnInfo[]>( [] );
  tableColumns = computed<string[]>(() => this.getTableColumns( this.tableDetails() ));
  
  dateFormat: string = 'dd/MM/yyyy';
  moneyFormat: string = '$';

  uniqueIndex: number = 0;

  tableData: any[] = [];
  rowCount: number = 0;
  sort: SortType = { column_name: 'id', order: 'ASC' };
  limit: number = 5;
  offset: number = 0;
  groupby: string[] = [];

  searchColumns: ColumnInfo[] = [
    { column_name: 'name', data_type: 'text' },
    { column_name: 'email', data_type: 'text' },
    { column_name: 'total_purchase', data_type: 'money' }
  ];

  highlightColumn: ColumnInfo = { ...this.searchColumns[0] };

  focusFilter: FilterEdit | GroupFilterEdit = this.groupFilter;

  loading: boolean = true;
  failToLoad: boolean = false;
  deleteId: number | null = null;
  errorDeleteMessage: string = '';
  uniqueColumn: string = 'vendor_id';

  dropdown: boolean = false;
  filterPopUp: boolean = false;
  confirmationPopUp: boolean = false;
  errorPopUp: boolean = false;
  groupbySearch: boolean = false;

  faPlus = faPlus;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faPencil = faPencil;
  faTrashCan = faTrashCan;

  constructor( private dataService: DataServiceService, private router: Router, private route: ActivatedRoute ) { }

  ngOnInit(): void {

    if ( localStorage.getItem('groupFilter') && localStorage.getItem('groupFilter') !== 'undefined' ) {

      this.groupFilterData = JSON.parse( localStorage.getItem( 'groupFilter' )! );

      const { newGroupFilter, newUniqueIndex } = this.getGroupFilterEdit( this.groupFilterData, undefined, this.uniqueIndex );

      this.groupFilter = newGroupFilter;
      this.uniqueIndex = newUniqueIndex;

    } else {

      localStorage.setItem('groupFilter', JSON.stringify( this.groupFilterData ));

    }

    if ( localStorage.getItem('groupList') && localStorage.getItem('groupList') !== 'undefined' ) {

      this.groupby = JSON.parse( localStorage.getItem( 'groupList' )! );

    } else {

      localStorage.setItem('groupList', JSON.stringify( this.groupby ));

    }

    if ( localStorage.getItem('rowLimit') && localStorage.getItem('rowLimit') !== 'undefined' ) {

      this.limit = JSON.parse( localStorage.getItem( 'rowLimit' )! );

    } else {

      localStorage.setItem('rowLimit', JSON.stringify( this.limit ));

    }

    this.retrieveVendorTableDetails();

    this.retrieveVendorResults();

  }

  retrieveVendorTableDetails() {

    this.dataService.retrieveVendorsTableDetails().subscribe({
      next: ( res ) => {

        if ( res.success ) {
          
          this.tableDetails.set( res.data );

          this.errorPopUp = false;

        } else {

          this.errorPopUp = true;

        }

      },
      error: ( error ) => {

        this.errorPopUp = true;

      }
    });

  }

  retrieveVendorResults() {

    this.loading = true;

    this.dataService.retrieveVendors( this.groupFilterData, this.sort, this.limit, this.offset, this.groupby ).subscribe({
      next: ( res ) => {

        if ( res.success ) {

          this.loading = false;
          this.failToLoad = false;

          this.tableData = res.data;

          this.rowCount = res.count;

        } else {

          this.failToLoad = true;

        }
  
      },
      error: ( error ) => {

        this.failToLoad = true;

      }
    });

  }

  setLocalGroupFilter( groupFilter: GroupFilterEdit ) {

    this.groupFilterData = this.getGroupFilterData( groupFilter );

    localStorage.setItem('groupFilter', JSON.stringify( this.groupFilterData ));

  }

  setLocalGroupList( groupList: string[] ) {

    localStorage.setItem('groupList', JSON.stringify( groupList ));

  }

  setLocalLimit( limit: number ) {

    localStorage.setItem('rowLimit', JSON.stringify( limit ));

  }

  private getTableColumns( tableDetails: ColumnInfo[] ): string[] {

    return tableDetails.map(( element ) => this.columnToString( element ));

  }

  getNextUniqueIndex(): string {

    return ++this.uniqueIndex + '';

  }

  columnToString( value: ColumnInfo ): string {

    return value.column_name;

  }

  stringToString( value: string ): string {

    return value;

  }

  filtersUpdate( newFilters: (FilterEdit | GroupFilterEdit)[] ) {

    this.groupFilter.filters = newFilters;

    this.setLocalGroupFilter( this.groupFilter );

    this.retrieveVendorResults();

  }

  filterAdd( filter: FilterEdit | null = null ) {

    if ( filter ) {

      this.groupFilter.filters = [ ...this.groupFilter.filters, filter ]

      this.setDropdown( false );

      this.setLocalGroupFilter( this.groupFilter );

      this.retrieveVendorResults();
    
    } else {

      const filter: FilterEdit = {
        column: this.tableDetails()[0],
        condition: '==',
        values: [],
        parent: this.groupFilter,
        id: this.getNextUniqueIndex()
      };

      switch ( this.tableDetails()[0].data_type ) {

        case 'text':
          filter.values = [ '' ];
          break;

        case 'number':
        case 'money':
          filter.values = [ '0' ];
          break;

        case 'date':
          filter.values = [ DateTime.now().toFormat( this.dateFormat ) ];
          break;

      }

      this.filterEdit( filter );

    }


  }

  filterEdit( filter: (FilterEdit | GroupFilterEdit) ) {
  
    this.focusFilter = filter;

    this.setDropdown( false );
    this.setFilterPopUp( true );

  }
  
  filterDelete() {

    this.groupFilter.filters = [];

    this.setLocalGroupFilter( this.groupFilter );

    this.retrieveVendorResults();

  }

  changeOperator( groupFilter: GroupFilterEdit, event: EventTarget ) {

    groupFilter.operator = (event as HTMLSelectElement).value as OperatorType;

    this.setLocalGroupFilter( this.groupFilter );

    this.retrieveVendorResults();

  }

  setDropdown( value: boolean ) {

    this.dropdown = value;

  }

  setFilterPopUp( value: boolean ) {

    this.filterPopUp = value;

  }

  setConfirmationPopUp( value: boolean ) {

    this.confirmationPopUp = value;

  }

  setErrorPopUp( value: boolean ) {

    this.errorPopUp = value;

  }

  setGroupbySearch( value: boolean ) {

    this.groupbySearch = value;

  }

  setDeleteId( value: number | null ) {

    this.deleteId = value;

  }

  groupAdd( group: string ) {

    this.groupby = [ ...this.groupby, group ];

    this.setLocalGroupList( this.groupby );

    this.retrieveVendorResults();

  }

  groupUp( index: number ) {

    if ( index <= 0 ) {

      return;

    }

    const groupToFront = this.groupby[ index ];
    const groupToBack = this.groupby[ index - 1 ];

    this.groupby = [ 
      ...this.groupby.slice( 0, index - 1 ), 
      groupToFront, 
      groupToBack, 
      ...this.groupby.slice( index + 1 ) 
    ];

    this.setLocalGroupList( this.groupby );

    this.retrieveVendorResults();

  }

  groupDown( index: number ) {
    
    if ( index >= this.groupby.length - 1 ) {

      return;

    }

    const groupToFront = this.groupby[ index + 1 ];
    const groupToBack = this.groupby[ index ];

    this.groupby = [ 
      ...this.groupby.slice( 0, index ), 
      groupToFront, 
      groupToBack, 
      ...this.groupby.slice( index + 2 ) 
    ];

    this.setLocalGroupList( this.groupby );

    this.retrieveVendorResults();

  }

  groupDelete( index: number ) {

    this.groupby = [ ...this.groupby.slice( 0, index ), ...this.groupby.slice( index + 1 ) ];

    this.setLocalGroupList( this.groupby );

    this.retrieveVendorResults();

  }

  groupUpdate() {

    this.setLocalGroupList( this.groupby );

    this.retrieveVendorResults();

  }

  limitUpdate() {

    this.setLocalLimit( this.limit );

    this.retrieveVendorResults();

  }

  isFilterEdit(obj: FilterEdit | GroupFilterEdit): obj is FilterEdit {

    return obj && !obj.hasOwnProperty( 'filters' );

  }

  getGroupFilterData( groupFilterEdit: GroupFilterEdit ): GroupFilter {

    let groupFilter: GroupFilter = { filters: [], operator: groupFilterEdit.operator };

    for ( const filter of groupFilterEdit.filters ) {

      if ( this.isFilterEdit( filter ) ) {

        const nextFilter = this.getFilterData( filter );

        groupFilter.filters = [ ...groupFilter.filters, nextFilter ];

      } else {

        const nextGroupFilter = this.getGroupFilterData( filter );

        groupFilter.filters = [ ...groupFilter.filters, nextGroupFilter ];

      }

    }

    return groupFilter;

  }

  getFilterData( filterEdit: FilterEdit ): Filter {

    return {
      column: filterEdit.column,
      condition: filterEdit.condition,
      values: filterEdit.values,
    }

  }

  isFilter(obj: Filter | GroupFilter): obj is Filter {

    return obj && !obj.hasOwnProperty( 'filters' );

  }

  getGroupFilterEdit( groupFilter: GroupFilter, parent: GroupFilterEdit | undefined, uniqueIndex: number ): { newGroupFilter: GroupFilterEdit, newUniqueIndex: number } {

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

  getFilterEdit( filter: Filter, parent: GroupFilterEdit, uniqueIndex: number ): FilterEdit {

    return {
      column: filter.column,
      condition: filter.condition,
      values: filter.values,
      parent: parent,
      id: uniqueIndex + ''
    }

  }

  exitFilterPopUp( value: boolean ) {

    this.setFilterPopUp(false);

    if ( value ) {

      this.setLocalGroupFilter( this.groupFilter );

      this.retrieveVendorResults();

    }

  }

  openConfirmationPopUp( id: number ) {

    this.errorDeleteMessage = '';
    this.setDeleteId( id );
    this.setConfirmationPopUp( true );

  }

  exitConfirmationPopUp() {

    this.errorDeleteMessage = '';
    this.setDeleteId( null );
    this.setConfirmationPopUp( false );
    
  }

  rowUpdate( id: number ) {

    this.router.navigate([ 'update', id ], { relativeTo: this.route });

  }

  rowDelete( id: number ) {

    this.dataService.deleteVendor( id ).subscribe({
      next: ( res ) => {

        if ( res.success ) {

          this.retrieveVendorResults();
          this.exitConfirmationPopUp();

        } else {

          this.errorDeleteMessage = 'Deletion failed. Please try again.'

        }

      }, error: ( error ) => {

        this.errorDeleteMessage = 'Failed to Connect to Backend. Please reload the Page.'

      }
    });

  }

  reload() {

    window.location.reload();

  }

}
