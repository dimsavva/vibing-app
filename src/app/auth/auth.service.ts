import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "https://localhost:44354"; // Ensure this is pointing to the correct API endpoint

  constructor(private http: HttpClient) {}

  private getLoginData(username: string, password: string): string {
    const formData = {
      grant_type: 'password',
      scope: "offline_access openid profile email phone",
      username: username,
      password: password,
      client_id: "VibingGardens_App",
      redirectUri: "http://localhost:8100/",
      responseType: "code"
      };

    return Object.entries(formData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = this.getLoginData(username, password);

    return this.http.post(`${this.apiUrl}/connect/token`, body, { headers });
  }

  logout(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/account/logout`);
  }

  getTenant(tenantName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/abp/multi-tenancy/tenants/by-name/${tenantName}`);
  }

  getTenantById(tenantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/abp/multi-tenancy/tenants/by-id/${tenantId}`);
  }
}
