import { Component, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-confirmation-popup',
  imports: [ FontAwesomeModule ],
  templateUrl: './confirmation-popup.component.html',
  styleUrl: './confirmation-popup.component.css'
})
export class ConfirmationPopupComponent {

  confirmation = output();
  cancel = output();

  faX = faX;

  onConfirm() {

    this.confirmation.emit();

  }

  onExit() {

    this.cancel.emit();

  }

}
