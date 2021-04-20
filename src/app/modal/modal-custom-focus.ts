import { Component } from "@angular/core";
import { ModalDismissReasons, UsaModal, UsaModalRef } from "uswds-components";

@Component({
  selector: `usa-modal-custom-focus`,
  template: `
  <ng-template #content let-modal>
    <h2 class="usa-modal__heading" id="modal-1-heading">
      Are you sure you want to continue?
    </h2>
    <div class="usa-prose">
      <p id="modal-1-description">You have unsaved changes that will be lost.</p>
    </div>
    <div class="usa-modal__footer">
      <ul class="usa-button-group">
        <li class="usa-button-group__item">
            <button type="button" class="usa-button" (click)="close('Continue')">Continue without saving</button>
        </li>
        <li class="usa-button-group__item">
          <button type="button" usaAutoFocus class="usa-button usa-button--unstyled padding-105 text-center" (click)="close('Go Back')">Go back</button>
        </li>
      </ul>
    </div>
  </ng-template>
  <div class="display-block margin-bottom-2"><code>usaAutoFocus</code> on element to recieve focus on open</div>
  <button class="usa-button" (click)="open(content)">Auto Focus 'Go Back' button on open</button>
  <hr>
  <pre>{{ closeResult }}</pre>
  `
})
export class ModalCustomFocusComponent {
  closeResult = '';

  modalRef: UsaModalRef;

  constructor(private modalService: UsaModal) {}

  open(content) {
    this.modalRef = this.modalService.open(content)
    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  close(reason) {
    this.modalRef.close(reason);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else if (reason === ModalDismissReasons.CLOSE_CLICKED) {
      return 'by clicking close button';
    }
    else {
      return `with: ${reason}`;
    }
  }
}