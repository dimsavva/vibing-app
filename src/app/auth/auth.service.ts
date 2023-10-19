import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string, tenantName: string = 'Vibing'): Observable<any> {
   
    //add heqaders 
    const headers = new HttpHeaders({
      'abp.tenantid': '2',
      
    });
    
   // setcookie
    document.cookie = "Abp.TenantId=2" + ";path=/";
    const body = {
      usernameOrEmailAddress: email,
      password: password,
      rememberClient: false,
    };
    

    return this.http.post(`${this.apiUrl}/TokenAuth/Authenticate`, body, { headers });
  }
}