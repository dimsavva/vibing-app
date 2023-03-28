import { Component } from '@angular/core';
import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Use Capacitor StatusBar plugin to set status bar style and color
      CapacitorStatusBar.setBackgroundColor({ color: '#4caf50' });

    });
  }
}