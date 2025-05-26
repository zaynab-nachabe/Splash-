import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { GameStatisticsService } from '../../../shared/services/game-statistics.service';
import { User } from '../../../shared/models/user.model';
import { GameStatistics } from '../../../shared/models/game-statistics.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ergo-stat-selected-page',
  templateUrl: './ergo-stat-selected-page.component.html',
  styleUrls: ['./ergo-stat-selected-page.component.scss']
})
export class ErgoStatSelectedPageComponent implements OnInit, OnDestroy {
  activeTab: string = 'total';
  selectedUser?: User;
  childStatistics: GameStatistics[] = [];
  currentStatistic?: GameStatistics;
  private userSubscription?: Subscription;

  // Define tabs structure
  mainTabs = [
    { id: 'total', label: 'TOTAL' },
    { id: 'derniere', label: 'Dernière partie' }
  ];

  sections = [
    {
      title: 'HISTORIQUE',
      tabs: [
        { id: 'session2', label: 'Session 2' },
        { id: 'session1', label: 'Session 1' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private gameStatisticsService: GameStatisticsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Subscribe to the selected user from the service
    this.userSubscription = this.userService.selectedUser$.subscribe(user => {
      if (!user) {
        console.error('No user selected, navigating back to user selection');
        this.router.navigate(['/ergo-stats']);
        return;
      }

      this.selectedUser = user;
      console.log('Selected user for statistics:', this.selectedUser);

      // Load statistics for this user
      this.loadGameStatistics(user.userId);
    });
  }
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }


  loadGameStatistics(userId: string): void {
    this.gameStatisticsService.getStatisticsForChild(userId)
      .subscribe(stats => {
        console.log('Received statistics:', stats);
        this.childStatistics = stats;
        console.log('available session', stats.map(stat=>stat.sessionName));
        this.setCurrentStatistic(this.activeTab);
        this.cdr.detectChanges();
      });
  }

  setCurrentStatistic(tabId: string): void {
    // Map tab IDs to session names
    let sessionName: string;

    switch (tabId) {
      case 'total':
        sessionName = 'TOTAL';
        break;
      case 'derniere':
        sessionName = 'Session 3'; // Latest session
        break;
      case 'session2':
        sessionName = 'Session 2';
        break;
      case 'session1':
        sessionName = 'Session 1';
        break;
      default:
        sessionName = 'TOTAL';
    }

    
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.setCurrentStatistic(tabId);
  }

  get userIconPath(): string {
    return `assets/images/child-pps/${this.selectedUser?.icon || 'pp-9.png'}`;
  }
}
