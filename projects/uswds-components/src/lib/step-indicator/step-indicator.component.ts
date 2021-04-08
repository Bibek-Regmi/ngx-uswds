import { Component, ContentChild, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UsaStepIndicatorHeaderComponent } from './step-indicator-header.component';
import { StepIndicatorConfig } from './step-indicator.config';
import { Key, KeyCode, MicrosfotKeys } from '../util/key';
import { getNextItemIndexInList, findLastIndex } from '../util/util';

let stepIndicatorId = 0;

@Component({
  selector: 'usa-step-indicator',
  templateUrl: './step-indicator.component.html',
  host: {
    'class': 'usa-step-indicator',
    '[class.usa-step-indicator--no-labels]': 'hideLabels',
    '[class.usa-step-indicator--center]': 'centerLabels && !hideLabels',
    '[class.usa-step-indicator--counters]': 'displayCounters && !smallCounters',
    '[class.usa-step-indicator--counters-sm]': 'smallCounters',

  }
})
export class UsaStepIndicatorComponent implements OnChanges {

  @ContentChild('UsaStepHeader') header: UsaStepIndicatorHeaderComponent;

  /**
   * Hides labels on each step when set to true
   */
  @Input() hideLabels: boolean;

  /**
   * Centers label with the step bar when set to true
   */
  @Input() centerLabels: boolean;

  /**
   * Displays step counter
   */
  @Input() displayCounters: boolean;

  /**
   * Shrinks size of displayed step counter
   */
  @Input() smallCounters: boolean;

  /**
   * Whether to place the header above or below the step indicator
   */
  @Input() headerPosition: 'top' | 'bottom';

  @Input() id: string = `usa-step-indicator-${stepIndicatorId++}`;

  /**
   * Currently selected step
   */
  @Input() currentStep: number = 0;

  /**
   * All possible steps
   */
  @Input() steps: any[];

  @Output() currentStepChange = new EventEmitter();

  constructor(
    config: StepIndicatorConfig,
    private elementRef: ElementRef,
  ) { 
    this.hideLabels = config.hideLabels;
    this.centerLabels = config.centerLabels;
    this.displayCounters = config.displayCounters;
    this.smallCounters = config.smallCounters;
    this.headerPosition = config.headerPosition;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentStep) {
      if (this.currentStep > this.steps.length - 1 || this.currentStep < 0) {
        throw new Error(`Steps in step indicator is out of bounds. 
          Current Step: ${this.currentStep}, Step Range: 0 - ${this.steps.length - 1}`);
      }
    }
  }

  onStepClicked(stepIndex: number, step: any) {
    if (step.disabled) {
      return;
    }

    this.currentStepChange.emit(stepIndex);
  }

  onKeyUp(event: KeyboardEvent, index: number) {
    const keyPressed = event.key || event.keyCode;
    let nextStepIndex: number;
    switch(keyPressed) {
      case Key.ArrowRight:
      case MicrosfotKeys.ArrowRight:
      case KeyCode.ArrowRight:
        nextStepIndex = getNextItemIndexInList(index, this.steps, 1);
        this._getAllStepListElements()[nextStepIndex].focus();
        event.preventDefault();
        break;
      case Key.ArrowLeft:
      case MicrosfotKeys.ArrowLeft:
      case KeyCode.ArrowLeft:
        nextStepIndex = getNextItemIndexInList(index, this.steps, -1);
        this._getAllStepListElements()[nextStepIndex].focus();
        event.preventDefault();       
        break;
      case Key.Home:
      case MicrosfotKeys.Home:
      case KeyCode.Home:
        nextStepIndex = this.steps.findIndex(step => !step.disabled);
        this._getAllStepListElements()[nextStepIndex].focus();
        event.preventDefault();
        break;
      case Key.End:
      case MicrosfotKeys.End:
      case KeyCode.End:
        nextStepIndex= findLastIndex(this.steps, (step => !step.disabled));
        this._getAllStepListElements()[nextStepIndex].focus();
        event.preventDefault();
        break;
      }
  }

  private _getAllStepListElements() {
    const listElements: NodeList = this.elementRef.nativeElement.querySelectorAll(`#${this.id} .usa-step-indicator__segment`);
    return Array.prototype.slice.call(listElements);
  }

}