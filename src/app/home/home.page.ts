import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  cards = [
    { id: 1, title: 'Capture Survey', icon: 'document-text-outline' },
    { id: 2, title: 'Card 2', icon: 'albums-outline' },
    { id: 3, title: 'Card 3', icon: 'analytics-outline' },
    { id: 4, title: 'Card 4', icon: 'archive-outline' },
    { id: 5, title: 'Card 5', icon: 'at-outline' },
    { id: 6, title: 'Card 6', icon: 'bar-chart-outline' },
  ];
  constructor(private router: Router) {}
  onButtonClick() {
    console.log('Button clicked!');
  }
  onCardClick(id: number) {
    if (id === 1) {
      this.router.navigate(['/capture-survey']);
    } else {
      console.log('Card clicked:', id);
      // Implement the logic for handling other card clicks
    }  }
}
