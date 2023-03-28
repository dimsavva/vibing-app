import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaptureSurveyRoutingModule } from './capture-survey-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CaptureSurveyComponent } from './capture-survey/capture-survey.component';
 

@NgModule({
  declarations: [CaptureSurveyComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaptureSurveyRoutingModule,
    SharedModule,
    
  ],
  exports: []
})
export class CaptureSurveyModule { }
