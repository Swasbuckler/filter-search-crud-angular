import { Component, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-error-popup',
  imports: [ FontAwesomeModule ],
  templateUrl: './error-popup.component.html',
  styleUrl: './error-popup.component.css'
})
export class ErrorPopupComponent {

  reload = output();

  faRotateRight = faRotateRight;

  onReload() {

    this.reload.emit();

  }

}
