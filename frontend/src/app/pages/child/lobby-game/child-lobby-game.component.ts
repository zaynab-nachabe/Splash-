import { Component } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-child-lobby-game',
  templateUrl: './child-lobby-game.component.html',
  styleUrl: './child-lobby-game.component.scss'
})
export class ChildLobbyGameComponent {

    user!: User;

constructor(private userService: UserService) {
    this.userService.selectedUser$.subscribe((user: User | null) => {
        if (user) {
            this.user = user;
        } else {
            // Handle the case where no user is selected, e.g. redirect or show a message
            console.warn('No user selected in lobby.');
        }
    });
}

    ngOnInit() {
        console.log(this.user);
    }   
}

