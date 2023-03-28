import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular'; // Add this import

import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonicModule, // Add IonicModule here
    AuthRoutingModule,


  ],
})
export class AuthModule {}
