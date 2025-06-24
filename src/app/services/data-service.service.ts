import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupFilter, SortType, VendorForm } from './definitions';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {

  private apiURL: string = process.env['BACKEND_URL']!;

  constructor(private http: HttpClient) {}

  retrieveVendors( groupFilter: GroupFilter, sort: SortType, limit: number, offset: number, groupby: string[] ): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post( this.apiURL + 'vendors', JSON.stringify({ groupFilter, sort, limit, offset, groupby }), { headers: headers } );
  }

  retrieveVendorsTableDetails(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get( this.apiURL + 'vendors/table-details', { headers: headers } );
  }

  createVendor( newVendor: VendorForm ): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post( this.apiURL + 'vendors/create', JSON.stringify({ newVendor }), { headers: headers } );
  }

  getVendor( vendorId: number ): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post( this.apiURL + 'vendors/fetch', JSON.stringify({ vendorId }), { headers: headers } );
  }

  updateVendor( vendorId: number, updateVendor: VendorForm ): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post( this.apiURL + 'vendors/update', JSON.stringify({ vendorId, updateVendor }), { headers: headers } );
  }

  deleteVendor( vendorId: number ): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post( this.apiURL + 'vendors/delete', JSON.stringify({ vendorId }), { headers: headers } );
  }
  
}
