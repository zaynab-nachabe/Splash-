import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-card',
  template: `
    <div class="icon">
      <ng-content *ngIf="!user"></ng-content>
      <img *ngIf="user" src="../../assets/images/child-pps/{{user.icon}}" alt="icone de {{user.name}}">
    </div>
    <div class="name" *ngIf="user">
      {{user.name}}
    </div>
  `,
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent implements OnInit {
  @Input() user?: User;

  constructor(private userService: UserService) {}

  ngOnInit(): void {}
}
