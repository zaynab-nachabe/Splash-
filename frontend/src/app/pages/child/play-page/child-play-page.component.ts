import { Component } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-child-play-page',
  templateUrl: './child-play-page.component.html',
  styleUrl: './child-play-page.component.scss'
})
export class ChildPlayPageComponent {
    
    user!: User;

constructor(private userService: UserService) {
    this.userService.selectedUser$.subscribe((user: User | null) => {
        if (user) {
            this.user = user;
        } else {
            // Handle the case where no user is selected, e.g. redirect or show a message
            console.warn('No user selected in play page.');
        }
    });
}

    ngOnInit() {
        console.log(this.user);
    }
}
