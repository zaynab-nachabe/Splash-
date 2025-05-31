import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameStatistics } from 'src/app/shared/models/game-statistics.model';
import { childRankingMock } from '../../../shared/mocks/childRanking-mock';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { GameStatisticsService } from 'src/app/shared/services/game-statistics.service';

@Component({
  selector: 'app-child-stat-page',
  templateUrl: './child-stat-page.component.html',
  styleUrls: ['./child-stat-page.component.scss']
})

export class ChildStatPageComponent implements OnInit, OnDestroy {
  activeTab: string = 'last';
  showHistorique: boolean = false;
  searchTerm: string = '';
  historiqueSidebarOpen = true;


  selectedUser?: User;
  user!: User;
  childStatistics: GameStatistics[] = [];
  currentStatistic?: GameStatistics;
  private userSubscription?: Subscription;

  // Define tabs structure
  mainTabs = [
    { id: 'last', label: 'Dernière partie' },
    { id: 'average', label: 'Moyenne' }
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
    this.userService.selectedUser$.subscribe((user: User | null) => {
      if (!user) {
        console.error('No user selected, navigating back to user selection');
        this.router.navigate(['/child-list']);
        return;
      }
      this.user = user;
      console.log('Selected user for statistics:', user);
      // Load statistics for this user
      this.loadGameStatistics(user.userId);
      console.log('Loaded game statistics for user:', user.userId);
      console.log('GameStatisticsService initialized');

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
        console.log('in load game statistics: active tag is :', this.activeTab);
        console.log('in load game statistics: Game statistics loaded:', this.childStatistics);
        console.log('In load game statistics: Current statistic set to:', this.currentStatistic);
      });

  }

  setCurrentStatistic(tabId: string): void {
    if (tabId === 'last') {
      // Find the session with the latest date
      const sessions = this.childStatistics.filter(stat => stat.sessionName && stat.sessionName !== 'TOTAL');
      console.log('Filtered sessions:', sessions);
      if (sessions.length > 0) {
        sessions.sort((a, b) => {
          // Parse date from sessionName
          const dateA = new Date(a.sessionName.replace(/^Session /, ''));
          const dateB = new Date(b.sessionName.replace(/^Session /, ''));

          //console.log('session A is' + a.sessionName + ' and session B is ' + b.sessionName);
          //console.log('date A is' + dateA + ' and date B is ' + dateB);
          return dateB.getTime() - dateA.getTime();
        });
        this.currentStatistic = sessions[0];
        console.log('in set current statistic: current statistic is set to:', this.currentStatistic);
        console.log('in set current statistic: latest session is:', sessions[0]);
        return;
      }
    } else if (tabId === 'average') {
      // Compute average (for now, just use the last game as placeholder)
      const sessions = this.childStatistics.filter(stat => stat.sessionName && stat.sessionName !== 'TOTAL');
      if (sessions.length > 0) {
        // TODO: Compute real average
        this.currentStatistic = sessions[0];
        return;
      }
    }
    this.currentStatistic = undefined;
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.showHistorique = false;
    this.setCurrentStatistic(tabId);
  }


  showHistoriquePage(): void {
    this.showHistorique = true;
  }

  get filteredSessions() {
    if (!this.searchTerm) return this.childStatistics.filter(stat => stat.sessionName && stat.sessionName !== 'TOTAL');
    return this.childStatistics.filter(stat =>
      stat.sessionName &&
      stat.sessionName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get userIconPath(): string {
    const icon = this.user?.icon || this.selectedUser?.icon || 'pp-9.png';
    return `assets/images/child-pps/${icon}`;

  }


  selectHistoriqueSession(stat: GameStatistics) {
  this.currentStatistic = stat;
  this.historiqueSidebarOpen = false;
}
}
