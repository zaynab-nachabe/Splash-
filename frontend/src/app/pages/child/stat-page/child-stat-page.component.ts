import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-child-stat-page',
  templateUrl: './child-stat-page.component.html',
  styleUrls: ['./child-stat-page.component.scss']
})
export class ChildStatPageComponent implements OnInit {
  user!: User;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.selectedUser$.subscribe(selected => {
      if (!selected) {
        this.router.navigate(['/child-list']);
        return;
      }
      this.user = selected;
    });
  }
}