import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { VendorsComponent } from './pages/vendors/vendors.component';
import { CreateVendorComponent } from './pages/vendors/create-vendor/create-vendor.component';
import { UpdateVendorComponent } from './pages/vendors/update-vendor/update-vendor.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Vendors',
    children: [
      {
        path: '',
        component: VendorsComponent,
        title: 'Vendors',
      },
      {
        path: 'create',
        component: CreateVendorComponent,
        title: 'Create Vendor',
      },
      {
        path: 'update/:id',
        component: UpdateVendorComponent,
        title: 'Update Vendor',
      },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Page Not Found',
  },
];
