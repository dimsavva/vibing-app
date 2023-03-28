import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:44311'; // Replace with your ABP API URL

  constructor(private http: HttpClient) {}

  login(email: string, password: string, tenantName: string = 'Vibing'): Observable<any> {
    const body = {
      usernameOrEmailAddress: email,
      password: password,
      rememberClient: true,
      tenantName: tenantName, // Add this line
    };

    return this.http.post(`${this.apiUrl}/api/TokenAuth/Authenticate`, body);
  }
}