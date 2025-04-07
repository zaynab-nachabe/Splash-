import { Component } from '@angular/core';
import { playerGameStatMock } from '../../../shared/mocks/playerGamestat-mock';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
@Component({
  selector: 'app-ergo-stat-selected-page',
  templateUrl: './ergo-stat-selected-page.component.html',
  styleUrl: './ergo-stat-selected-page.component.scss'
})
export class ErgoStatSelectedPageComponent {
  gamestat = playerGameStatMock;

  getGradePerNotion(): { notion: string; grade: number }[] {
    return Object.entries(this.gamestat.gradePerNotion).map(([notion, grade]) => ({
      notion,
      grade
    }));
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
