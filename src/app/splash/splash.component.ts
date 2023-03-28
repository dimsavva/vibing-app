import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Add this import

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements OnInit {
  constructor(private router: Router) {} // Inject the Router

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 3000);
  }
}