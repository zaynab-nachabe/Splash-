import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-button',
  template: `
    <button class="home-button" (click)="navigateToHome()">Home</button>
  `,
  styleUrls: ['./home-button.component.scss']
})
export class HomeButtonComponent {
  constructor(private router: Router) {}

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}