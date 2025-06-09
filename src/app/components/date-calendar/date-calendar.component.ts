import { Component, effect, input, output, untracked } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackwardStep, faCaretLeft, faCaretRight, faForwardStep } from '@fortawesome/free-solid-svg-icons';
import { DateTime, DurationLike } from 'luxon';

@Component({
  selector: 'app-date-calendar',
  imports: [ FontAwesomeModule ],
  templateUrl: './date-calendar.component.html',
  styleUrl: './date-calendar.component.css'
})
export class DateCalendarComponent {
  
  dateFormat = input<string>('dd/MM/yyyy');

  dateSelect = input.required<string>();

  pointUp = input<boolean>(true);

  dateSelectChange = output<string>();

  currentDateTime: DateTime<boolean> = DateTime.now();
  selectedDateTime = this.currentDateTime;

  dayList: DateTime[] = this.getDaysInMonth( this.selectedDateTime.year, this.selectedDateTime.month );
  firstWeekday: number = DateTime.local(this.selectedDateTime.year, this.selectedDateTime.month, 1).weekday % 7 + 1;

  weekdayList: string[] = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

  faBackwardStep = faBackwardStep;
  faCaretLeft = faCaretLeft;
  faCaretRight = faCaretRight;
  faForwardStep = faForwardStep;
  
  constructor() {

    effect(() => {

      const dateFormat = this.dateFormat();
      const dateSelect = this.dateSelect();

      untracked(() => {

        this.updateDateTime( dateSelect, dateFormat );
        this.changeSelected( this.selectedDateTime );


      });

    });

  }

  updateDateTime( dateSelect: string, dateFormat: string ) {

    this.currentDateTime = DateTime.fromFormat( dateSelect, dateFormat, { zone: 'local' } );
    this.setSelectedDateTime( this.currentDateTime );

  }

  getDaysInMonth( year: number, month: number ) {

    let date = DateTime.local( year, month, 1 );
    let days = [];

    while ( date.month === month ) {

      days.push( date );
      date = date.plus({ day: 1 });

    }

    return days;
    
  }

  changeSelected( selectedDateTime: DateTime<boolean> ) {

    this.firstWeekday = DateTime.local( selectedDateTime.year, selectedDateTime.month, 1 ).weekday % 7 + 1;
    
    this.updateDayList( selectedDateTime );

  }

  private updateDayList( selectedDateTime: DateTime<boolean> ) {

    this.dayList = this.getDaysInMonth( selectedDateTime.year, selectedDateTime.month );

    let date = DateTime.local( selectedDateTime.year, selectedDateTime.month, 1 );
    let daysInMonth = this.dayList.length;

    for ( let i = 1; i < this.firstWeekday; i++ ) {

      date = date.minus({ day: 1 });
      this.dayList = [ date, ...this.dayList ];

    }

    date = DateTime.local( selectedDateTime.year, selectedDateTime.month, daysInMonth );
    let endDates = 42 - this.dayList.length;

    for ( let i = 0; i < endDates; i++ ) {

      date = date.plus({ day: 1 });
      this.dayList = [ ...this.dayList, date ];

    }

  }

  addDateTimeValidity( time: DurationLike ): boolean {

    return this.selectedDateTime.plus( time ).isValid;

  }

  minusDateTimeValidity( time: DurationLike ): boolean {

    return this.selectedDateTime.minus( time ).isValid;

  }

  nextYear( selectedDateTime: DateTime<boolean> ) {

    if ( this.addDateTimeValidity({ year: 1 }) ) {

      this.setSelectedDateTime( selectedDateTime.plus({ year: 1 }) );
      this.changeSelected( this.selectedDateTime );

    }

  }

  lastYear( selectedDateTime: DateTime<boolean> ) {

    if ( this.minusDateTimeValidity({ year: 1 }) ) {

      this.setSelectedDateTime( selectedDateTime.minus({ year: 1 }) );
      this.changeSelected( this.selectedDateTime );

    }

  }

  nextMonth( selectedDateTime: DateTime<boolean> ) {

    if ( this.addDateTimeValidity({ month: 1 }) ) {

      this.setSelectedDateTime( selectedDateTime.plus({ month: 1 }) );
      this.changeSelected( this.selectedDateTime );

    }

  }

  lastMonth( selectedDateTime: DateTime<boolean> ) {

    if ( this.minusDateTimeValidity({ month: 1 }) ) {

      this.setSelectedDateTime( selectedDateTime.minus({ month: 1 }) );
      this.changeSelected( this.selectedDateTime );

    }

  }

  private setSelectedDateTime( value: DateTime ) {

    this.selectedDateTime = value;

  }

  selectDate( date: DateTime ) {

    this.setSelectedDateTime( date );
    this.dateSelectChange.emit(this.selectedDateTime.toFormat( this.dateFormat() ) );

  }

}
