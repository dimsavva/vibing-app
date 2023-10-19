import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private data: any;


  constructor() { 

    this.data = null;

  }

  setData(message: any): void {
    this.data = message;
  }

  getData(): any {
    return this.data;
  }
}
