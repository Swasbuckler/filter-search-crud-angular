import { Component, computed, ElementRef, OnInit, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DateCalendarComponent } from '../../../components/date-calendar/date-calendar.component';
import { ClickOutDirective } from '../../../directives/click-out/click-out.directive';
import { UpperCasePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { DataServiceService } from '../../../services/data-service.service';
import { DateTime } from 'luxon';
import { DataType, VendorForm } from '../../../services/definitions';

@Component({
  selector: 'app-update-vendor',
  imports: [ RouterLink, ReactiveFormsModule, DateCalendarComponent, ClickOutDirective, UpperCasePipe, FontAwesomeModule ],
  templateUrl: './update-vendor.component.html',
  styleUrl: './update-vendor.component.css'
})
export class UpdateVendorComponent implements OnInit {

  dateInput = viewChild.required<ElementRef<HTMLDivElement>>( 'dateInput' );

  dateUpdate = signal<number>(0);

  scrollPos = signal<{x: number, y: number}>({x: 0, y: 0});
  scrollX = computed(() => (this.dateUpdate() - this.scrollPos().x) + 'px');
  scrollY = computed(() => {
    const nextPos = this.dateInput().nativeElement.offsetTop + this.dateInput().nativeElement.offsetHeight - this.scrollPos().y;
    
    if ( nextPos > (document.body.clientHeight * 0.5) ) {
      this.pointUp = false;
      return ( nextPos - this.dateInput().nativeElement.offsetHeight ) + 'px';
    } else {
      this.pointUp = true;
      return nextPos + 'px';
    }
  });

  dateFormat: string = 'dd/MM/yyyy';
  moneyFormat: string = '$';

  typeList: string[] = [ 'Goods', 'Services' ];

  updateForm: FormGroup = new FormGroup({
    name: new FormControl( '' ),
    email: new FormControl( '' ),
    type: new FormControl( this.typeList[0] ),
    total_purchase: new FormControl( '0' ),
    created_by: new FormControl( DateTime.now().toFormat( this.dateFormat ) ),
  });

  previousPurchase: string = '0';
  previousDate: string = DateTime.now().toFormat( this.dateFormat );

  dateDropdown: boolean = false;
  success: boolean = true;
  newData: boolean = true;

  pointUp: boolean = true;

  vendorId: number | null = null;
  originalVendorData: VendorForm = {
    name: '',
    email: '',
    type: '',
    total_purchase: 0,
    created_by: '01/01/2025',
  }

  faArrowLeft = faArrowLeft;
  faPlus = faPlus;

  constructor( private dataService: DataServiceService, private router: Router, private route: ActivatedRoute ) { }

  ngOnInit(): void {
    
    this.vendorId = Number( this.route.snapshot.paramMap.get('id') );

    this.dataService.getVendor( this.vendorId ).subscribe(( res ) => {

      if ( res.success ) {

        this.originalVendorData = res.data;
        this.originalVendorData.total_purchase = Number( this.originalVendorData.total_purchase);
        this.originalVendorData.created_by = DateTime.fromISO( this.originalVendorData.created_by, {setZone: true}).setZone( 'local' ).toFormat( this.dateFormat );

        this.updateForm.patchValue({
          name: this.originalVendorData.name,
          email: this.originalVendorData.email,
          type: this.originalVendorData.type,
          total_purchase: this.originalVendorData.total_purchase,
          created_by: this.originalVendorData.created_by,
        });

        this.previousPurchase = this.originalVendorData.total_purchase.toString();
        this.previousDate = this.originalVendorData.created_by;

      }

    });

  }

  onSubmit() {

    if ( this.updateForm.valid ) {

      const newVendor: VendorForm = {
        name: this.updateForm.value.name,
        email: this.updateForm.value.email,
        type: this.updateForm.value.type,
        total_purchase: this.updateForm.value.total_purchase,
        created_by: this.transformValueToSubmit( this.updateForm.value.created_by, 'date' )
      };

      let newVendorData: any = {};

      for (const key in newVendor) {

        if ( newVendor[key as keyof VendorForm] === this.originalVendorData[key as keyof VendorForm] ) {

          continue;

        } else {

          newVendorData[key] = newVendor[key as keyof VendorForm]; 

        }

      }

      if ( Object.keys(newVendorData).length === 0 ) {

        this.newData = false;

        return;
      }

      this.success = true;
      this.newData = true;

      this.dataService.updateVendor( this.vendorId!, newVendorData ).subscribe({
        next: ( res ) => {

          if ( !res.success ) {

            this.success = false;
    
          } else {

            this.success = true;
            this.router.navigate( ['../../'], { relativeTo: this.route } );

          }
    
        }, error: ( error ) => {

          this.success = false;

        }
      });

    }

  }

  setDateDropdown( value: boolean ) {

    this.dateDropdown = value;

  }

  setTextValue( textId: 'name' | 'email' | 'type', value: string = this.updateForm.value[textId] ) {
    
    this.updateForm.controls[textId].setValue( value.trim() );

  }

  setNumberValue( numberId: 'total_purchase', value: string = this.updateForm.value[numberId] ) {

    if ( Number( value ) ) {

      this.updateForm.controls[numberId].setValue( Number( value ) + '' );
      this.previousPurchase = Number( value ) + '';

    } else {

      this.updateForm.controls[numberId].setValue( this.previousPurchase );

    }

  }

  setDateValue( dateId: 'created_by', value: string = this.updateForm.value[dateId] ) {

    if ( DateTime.fromFormat( value, this.dateFormat, { zone: 'local' } ).isValid ) {
          
      this.updateForm.controls[dateId].setValue( value );
      this.previousDate = value;

    } else {

      this.updateForm.controls[dateId].setValue( this.previousDate );

    }

  }

  transformValueToSubmit( outputValue: string, dataType: DataType ): string {
  
    let newOutputValue: string = '';
  
    switch ( dataType ) {
  
      case 'date':
  
        newOutputValue = DateTime.fromFormat( outputValue, this.dateFormat).startOf('day').setZone( 'utc' ).toISO({ suppressMilliseconds: true })!.replace('Z', '+00:00');
        break;
  
      default:
        newOutputValue = outputValue;
  
    }
  
    return newOutputValue;

  }

  setScrollPos( value: { x: number, y: number } ) {

    this.scrollPos.set( value );

  }

  updateDateUpdate() {
    this.dateUpdate.set( this.dateInput().nativeElement.offsetLeft );
    this.setDateDropdown(true);
  }
  
}
