import { Component, OnInit } from '@angular/core';
import { playerGameStatMock } from '../../../shared/mocks/playerGamestat-mock';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { childRankingMock } from '../../../shared/mocks/childRanking-mock';

@Component({
  selector: 'app-ergo-stat-selected-page',
  templateUrl: './ergo-stat-selected-page.component.html',
  styleUrls: ['./ergo-stat-selected-page.component.scss']
})
export class ErgoStatSelectedPageComponent implements OnInit {
  gamestat = playerGameStatMock;
  user!: User;
  
  constructor(private userService: UserService) {
    this.userService.selectedUser$.subscribe((user: User) => {
      this.user = user;
    });
  }
  
  ngOnInit() {
    console.log('Selected user:', this.user);
  }
  
  getGradePerNotion(): { notion: string; grade: number }[] {
    return Object.entries(this.gamestat.gradePerNotion).map(([notion, grade]) => ({
      notion,
      grade
    }));
  }
  
  getRank(): { name: string; rank: number }[] {
    if (!this.user || !this.user.name) {
      console.warn('utilisateur n\'existe pas');
      return [];
    }
    const rank = childRankingMock[this.user.name];
    console.log(`${this.user.name} rank is: ${rank}`);
    return [{ name: this.user.name, rank }];
  }
}