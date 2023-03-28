import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaptureSurveyComponent } from './capture-survey/capture-survey.component';

const routes: Routes = [
  {
    path: '',
    component: CaptureSurveyComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaptureSurveyRoutingModule { }
