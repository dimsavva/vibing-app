import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {

  user = {
    email: '',
    password: '',
  };

  constructor(private router: Router, private authService: AuthService) {} // Inject AuthService
  ngOnInit() {
  }

  onSubmit() {
    this.router.navigate(['/home']); // Or another route after successful login

    return; // Remove this line after testing
    if (this.user.email && this.user.password) {
      this.authService.login(this.user.email, this.user.password).subscribe(
        (response) => {
          console.log('Authentication successful:', response);
          localStorage.setItem('auth_token', response.result.accessToken);
          this.router.navigate(['/home']); // Or another route after successful login
        },
        (error) => {
          console.error('Authentication failed:', error);
          // Handle the error, for example, show a message to the user
        }
      );
    } else {
      console.log('Invalid login form');
    }
  }
}



