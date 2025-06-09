import { Directive, ElementRef, model, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appClickOut]'
})
export class ClickOutDirective implements OnInit, OnDestroy {

  appClickOut = model.required<boolean>();

  constructor( private element: ElementRef, private zone: NgZone ) { }

  ngOnInit(): void {
    
    this.zone.runOutsideAngular(() => {

      document.addEventListener( 'click', this.clickOut.bind(this) );

    });

  }

  ngOnDestroy(): void {
    
    document.removeEventListener( 'click', this.clickOut.bind(this) );

  }

  clickOut( event: MouseEvent ) {

    if ( !this.appClickOut() ) return;

    if ( !this.element.nativeElement.contains( event.target ) ) {

      this.zone.run(() => {

        this.appClickOut.update(() => false);

      })

    }

  }

}
