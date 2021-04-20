import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {fromEvent, Subject} from 'rxjs';
import {filter, switchMap, take, takeUntil, tap} from 'rxjs/operators';

import {getFocusableBoundaryElements} from '../util/focus-trap';
import { Key, KeyCode, MicrosfotKeys} from '../util/key';
import {ModalDismissReasons} from './modal-dismiss-reasons';
import {usaRunTransition, UsaTransitionOptions} from '../util/transition/usaTransition';
import { AnimationEvent } from '@angular/animations';
import { usaDialogAnimations } from './modal-animations';

@Component({
  selector: 'usa-modal-window',
  animations: [usaDialogAnimations.dialogContainer],
  host: {
    '[class]': '"usa-modal" + (modalDialogClass ? " " + modalDialogClass : "")',
    '[class.fade]': 'animation',
    '[class.usa-modal--lg]': 'size === \'lg\'',
    'role': 'dialog',
    'tabindex': '-1',
    '[attr.aria-modal]': 'true',
    '[attr.aria-labelledby]': 'ariaLabelledBy',
    '[attr.aria-describedby]': 'ariaDescribedBy',
    '[@dialogContainer]': '_state',
  },
  template: `
    <div #dialog class="usa-modal__content">
      <div class="usa-modal__main">
        <ng-content></ng-content>
      </div>

      <button *ngIf="showClose" class="usa-button usa-modal__close" aria-label="Close this window" (click)="onCloseClicked()">
        <img aria-hidden="true" focusable="false" src="assets/image/close.svg" style="width: 15px" class="margin-top-2 margin-right-2">
      </button>
    </div>
    `,
  encapsulation: ViewEncapsulation.None,
})
export class UsaModalWindow implements OnInit,
    AfterViewInit, OnDestroy {
  private _closed$ = new Subject<void>();
  private _elWithFocus: Element | null = null;  // element that is focused prior to modal opening

  /** State of the dialog animation. */
  _state: 'void' | 'enter' | 'slideEnter';

  @ViewChild('dialog', {static: true}) private _dialogEl: ElementRef<HTMLElement>;

  @Input() animation: boolean;
  @Input() ariaLabelledBy: string;
  @Input() ariaDescribedBy: string;
  @Input() backdrop: boolean | string = true;
  @Input() keyboard = true;
  @Input() size: string;
  @Input() modalDialogClass: string;
  @Input() overlayElement: Element;
  @Input() showClose: boolean = true;

  @Output('dismiss') dismissEvent = new EventEmitter();

  shown = new Subject<void>();
  hidden = new Subject<void>();

  /** Emits when an animation state changes. */
  _animationStateChanged = new EventEmitter<AnimationEvent>();

  constructor(
      @Inject(DOCUMENT) private _document: any, 
      private _elRef: ElementRef<HTMLElement>, 
      private _zone: NgZone,
    ) {
      this._state = this.animation ? 'slideEnter' : 'enter';
    }

  dismiss(reason): void { this.dismissEvent.emit(reason); }

  ngOnInit() { this._elWithFocus = this._document.activeElement; }

  ngAfterViewInit() { this._show(); }

  ngOnDestroy() { this._disableEventHandling(); }

  hide() {
    this._disableEventHandling();
    this._restoreFocus();
    this.hidden.next();
    this.hidden.complete();
  }

  onCloseClicked() {
    this.dismiss(ModalDismissReasons.CLOSE_CLICKED);
  }

  private _show() {
    this._enableEventHandling();
    this._setFocus();
  }

  private _enableEventHandling() {
    const {nativeElement} = this._elRef;
    this._zone.runOutsideAngular(() => {
      fromEvent<KeyboardEvent>(nativeElement, 'keydown')
          .pipe(
              takeUntil(this._closed$),
              filter(e => e.key === Key.Escape || e.key === MicrosfotKeys.Escape || e.which === KeyCode.Escape))
          .subscribe(event => {
            if (this.keyboard) {
              requestAnimationFrame(() => {
                if (!event.defaultPrevented) {
                  this._zone.run(() => this.dismiss(ModalDismissReasons.ESC));
                }
              });
            }
          });

      let preventClose = false;
      fromEvent<MouseEvent>(this._dialogEl.nativeElement, 'mousedown')
          .pipe(
              takeUntil(this._closed$), tap(() => preventClose = false),
              switchMap(() => fromEvent<MouseEvent>(nativeElement, 'mouseup').pipe(takeUntil(this._closed$), take(1))),
              filter(({target}) => nativeElement === target))
          .subscribe(() => { preventClose = true; });

      fromEvent<MouseEvent>(this.overlayElement, 'click').pipe(takeUntil(this._closed$)).subscribe(({target}) => {
        if (this.overlayElement === target) {
          if (this.backdrop === true && !preventClose) {
            this._zone.run(() => this.dismiss(ModalDismissReasons.BACKDROP_CLICK));
          }
        }

        preventClose = false;
      });
    });
  }

  private _disableEventHandling() { this._closed$.next(); }

  private _setFocus() {
    const {nativeElement} = this._elRef;
    if (!nativeElement.contains(document.activeElement)) {
      const autoFocusable = nativeElement.querySelector(`[usaAutofocus]`) as HTMLElement;
      const firstFocusable = getFocusableBoundaryElements(nativeElement)[0];

      const elementToFocus = autoFocusable || firstFocusable || nativeElement;
      elementToFocus.focus();
    }
  }

  private _restoreFocus() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;

    let elementToFocus;
    if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    this._zone.runOutsideAngular(() => {
      setTimeout(() => elementToFocus.focus());
      this._elWithFocus = null;
    });
  }
}
