import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component'; // Add this import

const routes: Routes = [
  {
    path: '',
    component: SplashComponent, // Update this line to use the SplashComponent
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  // Add this route
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'capture-survey',
    loadChildren: () => import('./capture-survey/capture-survey.module').then( m => m.CaptureSurveyModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
