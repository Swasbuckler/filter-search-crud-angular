import { Component, effect, input, model, output, untracked } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { IsFilterPipe } from '../../pipes/is-filter/is-filter.pipe';
import { ListDisplayPipe } from '../../pipes/list-display/list-display.pipe';
import { ColumnCasePipe } from '../../pipes/column-case/column-case.pipe';
import { ColumnInfo, FilterEdit, GroupFilterEdit } from '../../services/definitions';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCaretDown, faCaretUp, faSearch, faFilter, faPencil, faX } from '@fortawesome/free-solid-svg-icons';
import { ColumnTransformPipe } from '../../pipes/column-transform/column-transform.pipe';

@Component({
  selector: 'app-search-bar',
  imports: [ ReactiveFormsModule, FormsModule, NgTemplateOutlet, IsFilterPipe, ListDisplayPipe, ColumnCasePipe, TitleCasePipe, ColumnTransformPipe, FontAwesomeModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {

  selectedColumn = input.required<ColumnInfo>();

  groupFilter = input.required<GroupFilterEdit>();

  searchPlaceholder = input.required<string>();

  dateFormat = input<string>('dd/MM/yyyy');
  moneyFormat = input<string>('$');

  groupList = model.required<string[]>();
  uniqueIndex = model.required<number>();
  dropdown = model.required<boolean>();

  groupFilterChange = output<(FilterEdit | GroupFilterEdit)[]>();
  filterChange = output<FilterEdit | GroupFilterEdit>();

  searchForm: FormGroup = new FormGroup({
    search: new FormControl('', [ Validators.required, Validators.minLength(1) ]),
  });

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

  groupLink: string = ' > '

  faSearch = faSearch;
  faCaretDown = faCaretDown;
  faCaretUp = faCaretUp;
  faFilter = faFilter;
  faPencil = faPencil;
  faX = faX;

  constructor() {

    effect(() => {

      const dropdown = this.dropdown();

      untracked(() => {

        if ( !dropdown ) {

          this.setSearch( '' );

        }

      })

    })

  }

  setDropdown( value: boolean ) {

    this.dropdown.update(() => value);

  }

  private setSearch( value: string ) {

    this.searchForm.patchValue({
      search: value
    });

  }

  onSubmit() {

    if ( this.searchForm.valid ) {

      this.setDropdown( false );

      this.uniqueIndex.update((uniqueIndex) => uniqueIndex + 1);
      const uniqueIndex = this.uniqueIndex();

      const newFilter: FilterEdit = {
        column: this.selectedColumn(),
        condition: 'in',
        values: [ this.searchForm.value.search ],
        parent: this.groupFilter(),
        id: uniqueIndex.toString()
      };

      this.groupFilterChange.emit([ ...this.groupFilter().filters, newFilter ]);

      this.setSearch( '' );

    }
  }

  deleteFilter( index: number ) {

    this.groupFilterChange.emit([
      ...this.groupFilter().filters.slice( 0, index ),
      ...this.groupFilter().filters.slice( index + 1 ),
    ]);

  }

  editFilter( filter: FilterEdit | GroupFilterEdit ) {
    
    this.filterChange.emit( filter );

  }

  deleteGroupBy() {

    this.groupList.update(() => []);

  }

}
