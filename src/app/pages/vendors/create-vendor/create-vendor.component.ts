import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import { DataServiceService } from '../../../services/data-service.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DateCalendarComponent } from '../../../components/date-calendar/date-calendar.component';
import { ClickOutDirective } from '../../../directives/click-out/click-out.directive';
import { UpperCasePipe } from '@angular/common';
import { DataType, VendorForm } from '../../../services/definitions';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-vendor',
  imports: [ RouterLink, ReactiveFormsModule, DateCalendarComponent, ClickOutDirective, UpperCasePipe, FontAwesomeModule ],
  templateUrl: './create-vendor.component.html',
  styleUrl: './create-vendor.component.css'
})
export class CreateVendorComponent {

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

  createForm: FormGroup = new FormGroup({
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

  pointUp: boolean = true;

  faArrowLeft = faArrowLeft;
  faPlus = faPlus;

  constructor( private dataService: DataServiceService, private router: Router, private route: ActivatedRoute ) { }

  onSubmit() {

    if ( this.createForm.valid ) {

      const newVendor: VendorForm = {
        name: this.createForm.value.name,
        email: this.createForm.value.email,
        type: this.createForm.value.type,
        total_purchase: this.createForm.value.total_purchase,
        created_by: this.transformValueToSubmit( this.createForm.value.created_by, 'date' )
      };

      this.success = true;

      this.dataService.createVendor( newVendor ).subscribe({
        next: ( res ) => {

          if ( !res.success ) {
    
            this.success = false;
    
          } else {

            this.success = true;
            this.router.navigate( ['../'], { relativeTo: this.route } );

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

  setTextValue( textId: 'name' | 'email' | 'type', value: string = this.createForm.value[textId] ) {
    
    this.createForm.controls[textId].setValue( value.trim() );

  }

  setNumberValue( numberId: 'total_purchase', value: string = this.createForm.value[numberId] ) {

    if ( Number( value ) ) {

      this.createForm.controls[numberId].setValue( Number( value ) + '' );
      this.previousPurchase = Number( value ) + '';

    } else {

      this.createForm.controls[numberId].setValue( this.previousPurchase );

    }

  }

  setDateValue( dateId: 'created_by', value: string = this.createForm.value[dateId] ) {

    if ( DateTime.fromFormat( value, this.dateFormat, { zone: 'local' } ).isValid ) {
          
      this.createForm.controls[dateId].setValue( value );
      this.previousDate = value;

    } else {

      this.createForm.controls[dateId].setValue( this.previousDate );

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
