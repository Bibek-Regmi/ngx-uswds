import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { UsaAccordionModule, USWDSCardModule} from "uswds-components";
import { AccordionComponent } from "./accordion.component";

@NgModule({
  imports: [
    CommonModule,
    UsaAccordionModule,
    USWDSCardModule,
  ],
  declarations: [
    AccordionComponent
  ],
  exports: [
    AccordionComponent
  ]
})
export class AccordionModule {}
