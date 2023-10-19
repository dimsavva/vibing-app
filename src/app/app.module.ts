import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http'; // Add this import
import { SharedModule } from './shared/shared.module';
import { CaptureSurveyModule } from './capture-survey/capture-survey.module'; // Add this import
import { ServiceWorkerModule } from '@angular/service-worker';
import { ListSurveysComponent } from './list-surveys/list-surveys.component';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { SharedService } from './services/shared.service';

@NgModule({
  declarations: [AppComponent, ListSurveysComponent, SettingsComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule, // Add HttpClientModule here
    MatButtonModule,
    AuthModule,
    SharedModule,
    CaptureSurveyModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }), // Add SharedModule here

  
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, ApiService,SharedService],
  bootstrap: [AppComponent],
})
export class AppModule {}
