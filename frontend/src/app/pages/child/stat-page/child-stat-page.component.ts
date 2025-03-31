import { Component } from '@angular/core';
import {childstatMock} from '../../../shared/mocks/childRanking-mock';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-child-stat-page',
  templateUrl: './child-stat-page.component.html',
  styleUrl: './child-stat-page.component.scss'
})
export class ChildStatPageComponent {

  childstat = childstatMock;

  getRank(userId: string) : number {
    return this.childstat[userId] || 0; //return 0 if the userId is not found
  }

  onSession2Click(): void{
    console.log("Session 2 clicked");
    //I don't know what to do next
  }

  onSession1Click(): void{
    console.log("Session 1 clicked");
  }
    user!: User;

    constructor(private userService: UserService) {
        this.userService.selectedUser$.subscribe((user: User) => {
            this.user = user;
        })
    }

    ngOnInit() {
        console.log(this.user);
    }   
}
