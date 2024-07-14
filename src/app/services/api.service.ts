import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;

export interface AudioDataDto {
  audioData?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  sync(): Observable<any> {
    return this.http.get<any>(
      `${API_URL}/app/mobile-sync/sync`,
      { headers: this.setHeaders() },
    );
  }

  setHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });
    return headers;
  }

  transcribeAudio(audioData: AudioDataDto): Observable<string> {
    const transcriptionHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    });

    return this.http.post(
      `${API_URL}/app/transcription/transcribe-audio`,
      audioData,
      { headers: transcriptionHeaders, responseType: 'text' }
    );
  }

  uploadFile(base64Str: string, fileName: string): Observable<string> {
    return this.http.post<string>(
      `${API_URL}/app/mobile-sync/upload-item-image`,
      {
        base64Str: base64Str.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', ''),
        fileName: fileName,
      },
      {
        headers: this.setHeaders(),
        responseType: 'json',
      }
    );
  }

  submitSurveyData(data: any): Observable<string> {
    return this.http.post<string>(
      `${API_URL}/app/mobile-sync/submit-survey-data`,
      data,
      {
        headers: this.setHeaders(),
        responseType: 'json',
      }
    );
  }

  getUser(userId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    };
    return this.http.get<any>(
      `${API_URL}/app/User/Get?Id=${userId}`, {
        headers: this.setHeaders()
      }
    );
  }
}
