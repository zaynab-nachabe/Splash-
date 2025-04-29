import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../../shared/services/user.service";

@Component({
  selector: 'app-ergo-stat-page',
  templateUrl: './ergo-stat-page.component.html',
  styleUrl: './ergo-stat-page.component.scss'
})
export class ErgoStatPageComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Your initialization code here
  }
}
