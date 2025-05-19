import { Component } from '@angular/core';
import {UserService} from 'src/app/shared/services/user.service';
import {User} from 'src/app/shared/models/user.model';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-ergo-play-page',
  templateUrl: './ergo-play-page.component.html',
  styleUrl: './ergo-play-page.component.scss'
})
export class ErgoPlayPageComponent implements OnInit{
  allUsers: User[] = [];
    filteredUsers: User[] = [];
  
    constructor(private userService: UserService) {}
  
    ngOnInit(): void {
      this.userService.getUsers().subscribe(users => {
        this.allUsers = users;
        this.filteredUsers = [...this.allUsers];
      });
    }
  
    filterUsers(searchText: string): void {
      if(!searchText) {
        this.filteredUsers = [...this.allUsers];
        return;
      }
  
      this.filteredUsers = this.allUsers.filter(user=>
        user.name.toLowerCase().includes(searchText.toLowerCase())
      )
    }
}
