import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Plugins } from '@capacitor/core';
import { ApiService } from '../services/api.service';
import { Subject, takeUntil } from 'rxjs';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  cards = [
    { id: 1, title: 'Capture Survey', icon: 'document-text-outline' },
    { id: 2, title: 'List Surveys', icon: 'list-outline' },
    { id: 3, title: 'Settings', icon: 'settings-outline' },
    { id: 4, title: 'Exit', icon: 'exit-outline' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private platform: Platform,
    private apiService: ApiService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.apiService
      .sync()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.sharedService.setData(data);
      });

    const userId = localStorage.getItem('userId') || '';
    const userIdentifier = parseInt(userId, 10);

    this.apiService
      .getUser(userIdentifier)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data.result.emailAddress);
        localStorage.setItem('emailAddress', data.result.emailAddress);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onButtonClick() {
    console.log('Button clicked!');
  }
  onCardClick(id: number) {
    if (id === 1) {
      this.router.navigate(['/capture-survey']);
    }
    if (id === 2) {
      this.router.navigate(['/list-surveys']);
    }
    if (id === 3) {
      this.router.navigate(['/settings']);
    }
    if (id === 4) {
      App.exitApp();
    }
  }

  async exitApp() {
    if (this.platform.is('pwa')) {
      await App.exitApp();
    } else {
      window.close();
    }
  }
}
