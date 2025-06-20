import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { GameStatisticsService } from 'src/app/shared/services/game-statistics.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-game-podium',
  templateUrl: './game-podium.component.html',
  styleUrls: ['./game-podium.component.scss']
})
export class GamePodiumComponent implements OnInit {
  public user!: User;
  public score!: number;
  public ranking!: number;
  public wordsPerMinute!: number;
  public mathNotionUnderstanding!: number;
  public precision!: number;
  public numberOfCorrections!: number;
  public answersShown!: number;
  public wordsLeastSuccessful!: { word: string, successRate: number }[];
  public heatmapData!: { keyCode: string, errorFrequency: number }[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private gameStatisticsService: GameStatisticsService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['score'] && params['user']) {
        const score = parseInt(params['score']);
        const user = JSON.parse(params['user']);
        
        // Add score as money to user's account
        this.userService.updateMoney(user.userId, score).subscribe({
          next: (updatedUser) => {
            console.log('Money updated successfully:', updatedUser.money);
          },
          error: (error) => {
            console.error('Error updating money:', error);
          }
        });
      }
    });
  }
}