import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform, private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {

      swUpdate.available.subscribe((event) => {
        console.log('current version is', event.current);
        if (confirm('New version available. Load New Version?')) {
          window.location.reload();
        }
      });

      this.swUpdate.checkForUpdate();

    }

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Use Capacitor StatusBar plugin to set status bar style and color
      // CapacitorStatusBar.setBackgroundColor({ color: '#4caf50' });
    });
  }
}
