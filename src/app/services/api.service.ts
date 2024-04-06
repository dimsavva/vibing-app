import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;


@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private http: HttpClient) { }

  sync(): Observable<any> {

    //set auth headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });

    return this.http.get<any>(
      `${API_URL}/app/mobile-sync/sync`,
      { headers },
    );
  }

  uploadFile(
    base64Str: string,
    fileName: string,
  ): Observable<string> {
    return this.http.post<string>(
      `${API_URL}/app/mobile-sync/upload-item-image`,
      {
        base64Str:  base64Str.replace('data:image/jpeg;base64,', ''),
        fileName: fileName,
      },
      {
        responseType: 'json',
      }
    );
  }
  submitSurveyData(
    data: any,

  ): Observable<string> {
    return this.http.post<string>(
      `${API_URL}/app/mobile-sync/submit-survey-data`,
      data,
      {
        responseType: 'json',
      }
    );
  }


  getUser(userId : number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    };
    return this.http.get<any>(
      `${API_URL}/app/User/Get?Id=${userId}`, { headers }
    );
  }
}


