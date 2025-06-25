import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnInfo, DataType, Filter, GroupFilter, SortType, VendorForm } from './definitions';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class DataServiceDemoService {

  private apiURL: string = process.env['BACKEND_URL']!;

  constructor(private http: HttpClient) {}

  retrieveVendors( groupFilter: GroupFilter, sort: SortType, limit: number, offset: number, groupby: string[] ): Observable<any> {
    return new Observable(( subscriber ) => {
      
      const vendorsTableDetails: ColumnInfo[] = [
        { column_name: 'vendor_id', data_type: 'number' },
        { column_name: 'name', data_type: 'text' },
        { column_name: 'email', data_type: 'text' },
        { column_name: 'type', data_type: 'text' },
        { column_name: 'total_purchase', data_type: 'money' },
        { column_name: 'created_by', data_type: 'date' }
      ];

      const vendors: any[] = JSON.parse( localStorage.getItem( 'vendors' )! );
      const vendorTypes: any[] = JSON.parse( localStorage.getItem( 'vendorTypes' )! );

      const vendorData: any[] = vendors.map(( row: any ) => {
        return {
          vendor_id: row.vendor_id,
          name: row.name,
          email: row.email,
          type: vendorTypes.find(( element: any ) => row.type_id === element.type_id).name,
          total_purchase: row.total_purchase,
          created_by: row.created_by,
        }
      });

      let sortColumn = vendorsTableDetails.find(( element ) => element.column_name === sort.column_name )
      if ( !sortColumn ) { sortColumn = vendorsTableDetails[0] }  
      const order = sort.order === 'ASC' ? -1 : 1;
      
      let tableData = vendorData.filter(( element ) => this.handleGroupFilter( element, groupFilter ) );

      const tableRows = tableData.length;
      
      tableData = tableData
        .sort(( a, b ) => {
          switch ( sortColumn.data_type ){
            case 'text':
            case 'number':
            case 'money':
              if (a[sortColumn.column_name] < b[sortColumn.column_name]) { return order; }
              if (a[sortColumn.column_name] > b[sortColumn.column_name]) { return order * -1; }
              return 0;
            
            case 'date':
              if (DateTime.fromISO( a[sortColumn.column_name], {setZone: true}).setZone( 'local' ) < DateTime.fromISO( b[sortColumn.column_name], {setZone: true}).setZone( 'local' )) { return order; }
              if (DateTime.fromISO( a[sortColumn.column_name], {setZone: true}).setZone( 'local' ) > DateTime.fromISO( b[sortColumn.column_name], {setZone: true}).setZone( 'local' )) { return order * -1; }
              return 0;
          }})
        .filter(( element, index ) => {
          if ( groupby.length === 0 ) {
            
            return index >= offset && index < offset + limit;

          }

          return true;
        });

      if ( groupby.length <= 0 ) {

        subscriber.next({ success: true, data: tableData, count: tableRows });

      } else {

        subscriber.next({ success: true, data: [ this.handleGroupings( tableData, vendorsTableDetails, groupby, 0 ) ], count: tableRows });

      }

    });
  }

  retrieveVendorsTableDetails(): Observable<any> {
    return new Observable(( subscriber ) => {

      const vendorsTableDetails: ColumnInfo[] = [
        { column_name: 'vendor_id', data_type: 'number' },
        { column_name: 'name', data_type: 'text' },
        { column_name: 'email', data_type: 'text' },
        { column_name: 'type', data_type: 'text' },
        { column_name: 'total_purchase', data_type: 'money' },
        { column_name: 'created_by', data_type: 'date' }
      ];

      subscriber.next({ success: true, data: vendorsTableDetails });
    });
  }

  createVendor( newVendor: VendorForm ): Observable<any> {
    return new Observable(( subscriber ) => {

      let vendors: any[] = JSON.parse( localStorage.getItem( 'vendors' )! );
      const vendorTypes: any[] = JSON.parse( localStorage.getItem( 'vendorTypes' )! );
    
      const newVendorData = {
        vendor_id: vendors[vendors.length - 1].vendor_id + 1,
        type_id: vendorTypes.find(( element: any ) => newVendor.type === element.name).type_id,
        name: newVendor.name.trim(),
        email: newVendor.email,
        total_purchase: Number( newVendor.total_purchase ),
        created_by: newVendor.created_by,
      }

      vendors = [ ...vendors, newVendorData ];

      localStorage.setItem('vendors', JSON.stringify( vendors ));

      subscriber.next({ success: true });

    });
  }

  getVendor( vendorId: number ): Observable<any> {
    return new Observable(( subscriber ) => {

      const vendors: any[] = JSON.parse( localStorage.getItem( 'vendors' )! );
      const vendorTypes: any[] = JSON.parse( localStorage.getItem( 'vendorTypes' )! );

      const vendorData: any[] = vendors.map(( row: any ) => {
        return {
          vendor_id: row.vendor_id,
          name: row.name,
          email: row.email,
          type: vendorTypes.find(( element: any ) => row.type_id === element.type_id).name,
          total_purchase: row.total_purchase,
          created_by: row.created_by,
        }
      });

      const vendor = vendorData.find(( element ) => element.vendor_id === vendorId);

      if ( vendor ) {

        subscriber.next({ success: true, data: vendor });

      } else {

        subscriber.next({ success: false });

      }

    });
  }

  updateVendor( vendorId: number, updateVendor: VendorForm ): Observable<any> {
    return new Observable(( subscriber ) => {

      let vendors: any[] = JSON.parse( localStorage.getItem( 'vendors' )! );
      const vendorTypes: any[] = JSON.parse( localStorage.getItem( 'vendorTypes' )! );

      for ( let i = 0; i < vendors.length; i++ ) {

        if ( vendors[i].vendor_id === vendorId ) {

          const newVendorData = {
            vendor_id: vendorId,
            type_id: vendorTypes.find(( element: any ) => updateVendor.type === element.name).type_id,
            name: updateVendor.name.trim(),
            email: updateVendor.email,
            total_purchase: Number( updateVendor.total_purchase ),
            created_by: updateVendor.created_by,
          }

          vendors = [
            ...vendors.slice( 0, i ),
            newVendorData,
            ...vendors.slice( i + 1 ),
          ];

          localStorage.setItem('vendors', JSON.stringify( vendors ));

          subscriber.next({ success: true });
          return;

        }

      }

      subscriber.next({ success: false });

    });
  }

  deleteVendor( vendorId: number ): Observable<any> {
    return new Observable(( subscriber ) => {

      let vendorData: any[] = JSON.parse( localStorage.getItem( 'vendors' )! );

      for ( let i = 0; i < vendorData.length; i++ ) {

        if ( vendorData[i].vendor_id === vendorId ) {

          vendorData = [
            ...vendorData.slice( 0, i ),
            ...vendorData.slice( i + 1 ),
          ];

          localStorage.setItem('vendors', JSON.stringify( vendorData ));

          subscriber.next({ success: true });
          return;

        }

      }

      subscriber.next({ success: false });

    });
  }

  private handleGroupFilter( element: VendorForm, groupFilter: GroupFilter ): boolean {

    let conditionList: boolean[] = [];

    for ( const filter of groupFilter.filters ) {

      if ( this.isFilter( filter ) ) {
      
        const nextCondition = this.handleFilter( element, filter );
        
        conditionList = [ ...conditionList, nextCondition ];

      } else if ( this.isGroupFilter( filter ) ) {

        const nextCondition = this.handleGroupFilter( element, filter );

        conditionList = [ ...conditionList, nextCondition ];

      }

    }

    if ( groupFilter.operator === 'AND' ) {
      return conditionList.length > 0 ? conditionList.reduce( ( accumulator, currentValue ) => accumulator && currentValue ) : true;
    } else {
      return conditionList.length > 0 ? conditionList.reduce( ( accumulator, currentValue ) => accumulator || currentValue ) : true;
    }
  }

  private handleFilter( element: VendorForm, filter: Filter ): boolean {

    let dataType: DataType = filter.column.data_type;

    const comparators = {
      '==': ( a: string, b: string ) => a === b,
      '!=': ( a: string, b: string ) => a !== b,
      'in': ( a: string, b: string ) => a.toLowerCase().indexOf( b.toLowerCase() ) !== -1,
      '!in': ( a: string, b: string ) => a.toLowerCase().indexOf( b.toLowerCase() ) === -1,
      '<_number': ( a: string, b: string ) => Number( a ) < Number( b ),
      '<_date': ( a: string, b: string ) => DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) < DateTime.fromISO( b, {setZone: true}).setZone( 'local' ),
      '<=_number': ( a: string, b: string ) => Number( a ) <= Number( b ),
      '<=_date': ( a: string, b: string ) => DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) <= DateTime.fromISO( b, {setZone: true}).setZone( 'local' ),
      '>_number': ( a: string, b: string ) => Number( a ) > Number( b ),
      '>_date': ( a: string, b: string ) => DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) > DateTime.fromISO( b, {setZone: true}).setZone( 'local' ),
      '>=_number': ( a: string, b: string ) => Number( a ) >= Number( b ),
      '>=_date': ( a: string, b: string ) => DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) >= DateTime.fromISO( b, {setZone: true}).setZone( 'local' ),
      '><_number': ( a: string, b: string, c: string ) => (Number( a ) >= Number( b ) && Number( a ) <= Number( c )),
      '><_date': ( a: string, b: string, c: string ) => (
        DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) >= DateTime.fromISO( b, {setZone: true}).setZone( 'local' ) && 
        DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) <= DateTime.fromISO( c, {setZone: true}).setZone( 'local' )),
      '!><_number': ( a: string, b: string, c: string ) => !(Number( a ) >= Number( b ) && Number( a ) <= Number( c )),
      '!><_date': ( a: string, b: string, c: string ) => !(
        DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) >= DateTime.fromISO( b, {setZone: true}).setZone( 'local' ) && 
        DateTime.fromISO( a, {setZone: true}).setZone( 'local' ) <= DateTime.fromISO( c, {setZone: true}).setZone( 'local' )),
    }

    switch ( filter.condition ) {

      case '==':
        return comparators['==']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );

      case '!=':
        return comparators['!=']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );

      case 'in':
        return comparators['in']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );

      case '!in':
        return comparators['!in']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );

      case '<':
        if ( dataType === 'number' || dataType === 'money' ) {
          return comparators['<_number']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );
        } else if ( dataType === 'date' ) {
          return comparators['<_date']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0] );
        }
        return false;

      case '<=':
        if ( dataType === 'number' || dataType === 'money' ) {
          return comparators['<=_number']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );
        } else if ( dataType === 'date' ) {
          return comparators['<=_date']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0] );
        }
        return false;

      case '>':
        if ( dataType === 'number' || dataType === 'money' ) {
          return comparators['>_number']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );
        } else if ( dataType === 'date' ) {
          return comparators['>_date']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0] );
        }
        return false;

      case '>=':
        if ( dataType === 'number' || dataType === 'money' ) {
          return comparators['>=_number']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString() );
        } else if ( dataType === 'date' ) {
          return comparators['>=_date']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0] );
        }
        return false;

      case '><':
        if ( dataType === 'number' || dataType === 'money' ) {
          return comparators['><_number']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString(), filter.values[1].toString() );
        } else if ( dataType === 'date' ) {
          return comparators['><_date']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0], filter.values[1] );
        }
        return false;

      case '!><':
        if ( dataType === 'number' || dataType === 'money' ) {
          return comparators['!><_number']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0].toString(), filter.values[1].toString() );
        } else if ( dataType === 'date' ) {
          return comparators['!><_date']( element[filter.column.column_name as keyof VendorForm].toString(), filter.values[0], filter.values[1] );
        }
        return false;

      default:
        return false;

    }
  }

  private isFilter( obj: (Filter | GroupFilter) ): obj is Filter {
    
    return ( 
      obj && 
      (Object.hasOwn( obj, 'column' ) && Object.hasOwn( obj, 'condition' ) && Object.hasOwn( obj, 'values' ))
    );
  }

  private isGroupFilter( obj: GroupFilter ): obj is GroupFilter {

    return (
      obj && 
      (Object.hasOwn( obj, 'filters' ) && Object.hasOwn( obj, 'operator' ))
    );
  }

  private handleGroupings( tableData: any[], tableDetails: ColumnInfo[], groupList: string[], depth: number ): Record<string, any> {

    let newTableData: Record<string, any> = {};
    const maxDepth: number = groupList.length - 1;

    const column = tableDetails.find(( element ) => element.column_name === groupList[depth] );

    if ( column ) {

      const unique: string[] = [ ...new Set(tableData.map(( row ) => row[column.column_name])) ];

      for ( const value of unique ) {

        newTableData[value] = [];

      }

      for ( const row of tableData ) {

        newTableData[row[column.column_name]] = [ ...newTableData[row[column.column_name]], row ];

      }

      if ( depth < maxDepth ) {

        for ( const group in newTableData ) {

          newTableData[group] = this.handleGroupings( newTableData[group], tableDetails, groupList, depth + 1 );

        }

      }

    } else {

      newTableData['Invalid Group'] = [ ...tableData ];

    }

    return newTableData;

  }


}

/*
  Added Code to Vendors Component in the OnInit Function for the Demo

    if ( !( localStorage.getItem('vendors') && localStorage.getItem('vendors') !== 'undefined' ) ) {

      localStorage.setItem('vendors', JSON.stringify([
        {
          vendor_id: 1,
          type_id: 1,
          name: 'Full of Stock',
          email: 'stocksfull@gmail.com',
          total_purchase: 4000,
          created_by: '2024-06-02T10:00:00+00',
        },
        {
          vendor_id: 2,
          type_id: 1,
          name: 'Endless Goods INC',
          email: 'goodsforall@gmail.com',
          total_purchase: 3210,
          created_by: '2025-02-02T12:00:00+00',
        },
        {
          vendor_id: 3,
          type_id: 2,
          name: 'Bottle LinGo',
          email: 'lingobottle@hotmail.com',
          total_purchase: 2010,
          created_by: '2024-11-23T11:00:00+00',
        },
        {
          vendor_id: 4,
          type_id: 1,
          name: 'Discard Not',
          email: 'officialdn@gmail.com',
          total_purchase: 870,
          created_by: '2024-10-30T10:00:00+00',
        },
        {
          vendor_id: 5,
          type_id: 2,
          name: 'ForWarding Tech',
          email: 'wardingservices@tech.com',
          total_purchase: 2001,
          created_by: '2025-01-02T13:30:00+00',
        },
        {
          vendor_id: 6,
          type_id: 2,
          name: 'Hats Offs',
          email: 'hatoff@outlook.com',
          total_purchase: 2178,
          created_by: '2024-04-13T10:30:00+00',
        },
        {
          vendor_id: 7,
          type_id: 1,
          name: 'ForWarding Tech',
          email: 'warding@tech.com',
          total_purchase: 5099,
          created_by: '2025-01-02T10:00:00+00',
        },
        {
          vendor_id: 8,
          type_id: 1,
          name: 'Golden Horse',
          email: 'horsegg@gmail.com',
          total_purchase: 1000,
          created_by: '2025-03-02T09:00:00+00',
        },
        {
          vendor_id: 9,
          type_id: 2,
          name: 'Left For More',
          email: 'lfm@outlook.com',
          total_purchase: 750,
          created_by: '2024-09-22T18:00:00+00',
        },
        {
          vendor_id: 10,
          type_id: 2,
          name: 'Work for All',
          email: 'workallfor@gmail.com',
          total_purchase: 1000,
          created_by: '2025-01-03T10:00:00+00',
        },
        {
          vendor_id: 11,
          type_id: 1,
          name: 'Goodness Pal',
          email: 'gdpal@pal.com',
          total_purchase: 1200,
          created_by: '2025-03-21T10:00:00+00',
        },
        {
          vendor_id: 12,
          type_id: 1,
          name: 'Always Cart',
          email: 'cartalways@hotmail.com',
          total_purchase: 1000,
          created_by: '2024-08-30T14:00:00+00',
        },
      ]));

    }

    if ( !( localStorage.getItem('vendorTypes') && localStorage.getItem('vendorTypes') !== 'undefined' ) ) {

      localStorage.setItem('vendorTypes', JSON.stringify([
        {
          type_id: 1,
          name: 'Goods',
        },
        {
          type_id: 2,
          name: 'Services',
        },
      ]));

    }
*/