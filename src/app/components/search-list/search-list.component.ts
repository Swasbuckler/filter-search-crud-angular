import { Component, effect, ElementRef, input, output, untracked, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ColumnCasePipe } from '../../pipes/column-case/column-case.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-list',
  imports: [ FormsModule, ColumnCasePipe, TitleCasePipe, FontAwesomeModule ],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css'
})
export class SearchListComponent {

  listTitle = input<string>('');
  list = input.required<any[]>();
  valueToString = input.required<(value: any) => string>();
  inputValue = input<any>({
    transform: (value: any) => {
      if (!value) return undefined;

      return this.inputValue()( value );
    },
  });

  pointUp = input<boolean>(true);

  exit = output();
  submit = output<any>();

  searchBar = viewChild.required<ElementRef<HTMLInputElement>>( 'searchBar' );
  listItems = viewChildren<ElementRef<HTMLLIElement>>( 'contentItem' );

  searchValue: string = '';

  contentList: string[] = [];

  faX = faX;

  constructor() {

    effect(() => {

      const list = this.list();
      const valueToString = this.valueToString();

      untracked(() => {

        this.contentList = list.map(( element ) => valueToString( element ));

      });

    });

    effect(() => {

      this.searchBar();

      untracked(() => {

        this.searchBar().nativeElement.focus();

      });

    });

    effect(() => {

      this.listItems();

      untracked(() => {

        const focusElement: ElementRef<HTMLLIElement> | undefined = this.listItems().find(( item ) => item.nativeElement.innerHTML === this.inputValue());

        if ( focusElement ) {

          focusElement.nativeElement.scrollIntoView();

        }

      });


    });

  }

  changeSearch( searchValue: string ) {

    this.contentList = this.list().filter(( item ) => item.includes( searchValue.toLowerCase() ) );
  
  }

  closeSearch() {

    this.exit.emit();

  }

  choice( value: any ) {

    this.submit.emit( value );

  } 

  test( ref: HTMLInputElement ) {

    ref.focus();

  }

}
