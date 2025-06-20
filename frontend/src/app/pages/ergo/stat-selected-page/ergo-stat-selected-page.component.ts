import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ergo-stat-selected-page',
  templateUrl: './ergo-stat-selected-page.component.html',
  styleUrls: ['./ergo-stat-selected-page.component.scss']
})
export class ErgoStatSelectedPageComponent implements OnInit {
  user!: User;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the selected user from the service (adapt as needed for your app)
    this.userService.selectedUser$.subscribe(selected => {
      if (!selected) {
        // If no user is selected, redirect to the appropriate page
        this.router.navigate(['/ergo-play']);
        return;
      }
      this.user = selected;
    });
  }
}