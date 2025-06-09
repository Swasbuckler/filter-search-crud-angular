import { Component, computed, effect, input, model, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackwardStep, faCaretLeft, faCaretRight, faForwardStep } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pagination',
  imports: [ FormsModule, FontAwesomeModule ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {

  rowCount = input.required<number>();

  limit = model.required<number>();
  offset = model.required<number>();

  pageNumbers = computed(() => Array(Math.ceil(this.rowCount() / this.limit())).fill(0).map((x, index) => index));
  
  limitList: number[] = [ 3, 5, 10, 15, 30 ];
  currentPage: number = 0;

  faBackwardStep = faBackwardStep;
  faCaretLeft = faCaretLeft;
  faCaretRight = faCaretRight;
  faForwardStep = faForwardStep;

  constructor() {

    effect(() => {

      const rowCount = this.rowCount();
      const limit = this.limit();

      untracked(() => {

        this.changePage( 0, limit );
        
      });

    });

  }

  changePage( page: number, limit: number ) {

    this.currentPage = page;
    this.setOffset( this.currentPage, limit );

  }

  setOffset( currentPage: number, limit: number ) {

    this.offset.update(() => currentPage * limit );

  }

  distance( a: number, b: number ): number {

    return Math.abs( a - b );

  }

  nextPage( currentPage: number, limit: number ) {

    this.changePage( currentPage + 1, limit );

  }

  lastPage( currentPage: number, limit: number ) {

    this.changePage( currentPage - 1, limit );

  }

  focusPageInput( input: HTMLInputElement ) {

    this.setInputValue( input, '' );
    input.classList.remove('page-input');

  }

  blurPageInput( input: HTMLInputElement ) {

    this.setInputValue( input, '...' );
    input.classList.add('page-input');

  }

  choosePage( input: HTMLInputElement, limit: number ) {

    if ( !isNaN( Number(input.value) ) ) {

      this.goToPage( Number(input.value) - 1, limit );

    }

    this.setInputValue( input, '...' );
    input.blur();

  } 

  private setInputValue( input: HTMLInputElement, value: string ) {

    input.value = value;

  }

  goToPage( page: number, limit: number ) {

    if ( page < this.pageNumbers()[0] ) {

      this.changePage( this.pageNumbers()[0], limit );

    } else if ( page > this.pageNumbers().length - 1 ) {

      this.changePage( this.pageNumbers().length - 1, limit );

    } else {

      this.changePage( page, limit );

    }

  }

}
