import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  syncWifiOnly: boolean = false;

  constructor() {}

  ngOnInit() {
    // Retrieve wifionly setting from local storage
    let wifionlySetting = localStorage.getItem('syncWifiOnly');
    if (wifionlySetting === null) {
      localStorage.setItem('syncWifiOnly', this.syncWifiOnly.toString());
      wifionlySetting = 'false';
    }
    this.syncWifiOnly = wifionlySetting?.toString() === 'true';
    console.log(this.syncWifiOnly);
  }

  toggleWifiOnly(event: any) {
    localStorage.setItem('syncWifiOnly', event.detail.checked.toString());
  }

  clearCompletedSurveys() {
    if (confirm('Are you sure you want to clear all completed surveys?')) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.startsWith('survey_') &&
          JSON.parse(localStorage.getItem(key) || '{}').uploaded
        ) {
          localStorage.removeItem(key);
        }
      });
      alert('Completed surveys cleared.');
    }
  }
}
