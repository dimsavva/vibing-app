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
  authenticating: boolean = false;
  error :boolean = false;
  constructor(private router: Router, private authService: AuthService) {} // Inject AuthService
  ngOnInit() {
  }


  parseJwt (token:any) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
};
  onSubmit() {

    if (this.user.email && this.user.password) {

      this.authenticating = true;
      this.authService.login(this.user.email, this.user.password).subscribe(
        (response) => {
          console.log('Authentication successful:', response);
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('userId', response.id_token);
          const decodedToken = this.parseJwt(response.id_token);
          localStorage.setItem('emailAddress', decodedToken.email);

          this.router.navigate(['/home']); // Or another route after successful login
        },
        (error) => {
          console.error('Authentication failed:', error);
          // Handle the error, for example, show a message to the user
          this.authenticating = false;

          this.error = true;
        },
        () => {
          this.authenticating = false;
        }
      );
    } else {
      console.log('Invalid login form');
    }
  }
}



