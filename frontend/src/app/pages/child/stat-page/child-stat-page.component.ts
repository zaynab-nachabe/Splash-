import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameStatistics } from 'src/app/shared/models/game-statistics.model';
import { User } from 'src/app/shared/models/user.model';
import { GameStatisticsService } from 'src/app/shared/services/game-statistics.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-child-stat-page',
  templateUrl: './child-stat-page.component.html',
  styleUrl: './child-stat-page.component.scss'
})
export class ChildStatPageComponent implements OnInit, OnDestroy {
  activeTab: string = 'total';
  selectedUser?: User;
  user!: User;
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
  ) {
    this.userService.selectedUser$.subscribe((user: User) => {
      this.user = user;
      if (!user) {
        console.error('No user selected, navigating back to user selection');
        this.router.navigate(['/child-list']);
        return;
      }

      console.log('Selected user for statistics:', user);
      // Load statistics for this user
      this.loadGameStatistics(user.userId);
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadGameStatistics(userId: string): void {
    this.gameStatisticsService.getStatisticsForChild(userId)
      .subscribe(stats => {
        this.childStatistics = stats;
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

    // Get the statistic for this session
    this.currentStatistic = this.childStatistics.find(stat =>
      stat.sessionName === sessionName
    );
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.setCurrentStatistic(tabId);
  }

  get userIconPath(): string {
    const icon = this.user?.icon || this.selectedUser?.icon || 'pp-9.png';
    return `assets/images/child-pps/${icon}`;

  }
}
