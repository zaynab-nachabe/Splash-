import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameStatistics } from 'src/app/shared/models/game-statistics.model';
import { GameStatisticsService } from 'src/app/shared/services/game-statistics.service';

@Component({
  selector: 'app-statistics-box',
  templateUrl: './statistics-box.component.html',
  styleUrls: ['./statistics-box.component.scss']
})
export class StatisticsBoxComponent implements OnInit, OnDestroy {
  @Input() mode: 'child' | 'ergo' = 'child';
  @Input() childId!: string;

  statistics: GameStatistics[] = [];
  currentStatistic?: GameStatistics;
  loading: boolean = true;
  activeTab: string = 'last';

  historiqueSidebarOpen = false;
  searchTerm: string = '';

  private statsSub?: Subscription;

  mainTabs = [
    { id: 'last', label: 'Dernière partie' },
    { id: 'average', label: 'Moyenne' },
    { id: 'historique', label: 'Historique' }
  ];

  constructor(
    private statisticsService: GameStatisticsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.childId) {
      this.loadStatistics(this.childId);
    }
  }

  ngOnDestroy(): void {
    if (this.statsSub) {
      this.statsSub.unsubscribe();
    }
  }

  loadStatistics(childId: string): void {
    this.loading = true;
    this.statsSub = this.statisticsService.getStatisticsForChild(childId)
      .subscribe(stats => {
        console.log('Loaded statistics:', stats);
        this.statistics = stats;
        this.setCurrentStatistic(this.activeTab);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  setCurrentStatistic(tabId: string): void {
    if (tabId === 'last') {
      const sessions = this.statistics.filter(stat => stat.sessionName && stat.sessionName !== 'TOTAL');
      if (sessions.length > 0) {
        sessions.sort((a, b) => {
          const dateA = new Date(a.sessionName.replace(/^Session /, ''));
          const dateB = new Date(b.sessionName.replace(/^Session /, ''));
          return dateB.getTime() - dateA.getTime();
        });
        this.currentStatistic = sessions[0];
        return;
      }
    } else if (tabId === 'average') {
      const sessions = this.statistics.filter(stat => stat.sessionName && stat.sessionName !== 'TOTAL');
      if (sessions.length > 0) {
        const n = sessions.length;
        let totalScore = 0;
        let totalWPM = 0;
        let totalMath = 0;
        let totalPrecision = 0;
        let totalCorrections = 0;
        let totalAnswersShown = 0;
        let allWords: { word: string; successRate: number }[] = [];
        let allHeatmap: { [key: string]: { total: number; count: number } } = {};

        sessions.forEach(stat => {
          totalScore += stat.score || 0;
          totalWPM += stat.wordsPerMinute || 0;
          totalMath += stat.mathNotionUnderstanding || 0;
          totalPrecision += stat.precision || 0;
          totalCorrections += stat.numberOfCorrections || 0;
          totalAnswersShown += stat.answersShown || 0;
          if (stat.wordsLeastSuccessful) {
            allWords = allWords.concat(stat.wordsLeastSuccessful);
          }
          if (stat.heatmapData) {
            stat.heatmapData.forEach(h => {
              if (!allHeatmap[h.keyCode]) {
                allHeatmap[h.keyCode] = { total: 0, count: 0 };
              }
              allHeatmap[h.keyCode].total += h.errorFrequency;
              allHeatmap[h.keyCode].count += 1;
            });
          }
        });

        const avgScore = Math.round(totalScore / n);
        const avgWPM = Math.round(totalWPM / n);
        const avgMath = Math.round(totalMath / n);
        const avgPrecision = Math.round(totalPrecision / n);
        const avgCorrections = Math.round(totalCorrections / n);
        const avgAnswersShown = Math.round(totalAnswersShown / n);

        const wordMap: { [word: string]: { total: number; count: number } } = {};
        allWords.forEach(w => {
          if (!wordMap[w.word]) {
            wordMap[w.word] = { total: 0, count: 0 };
          }
          wordMap[w.word].total += w.successRate;
          wordMap[w.word].count += 1;
        });
        const averagedWords = Object.entries(wordMap).map(([word, data]) => ({
          word,
          successRate: Math.round(data.total / data.count)
        }));
        const top5LeastSuccessful = averagedWords
          .sort((a, b) => a.successRate - b.successRate)
          .slice(0, 5);

        const averagedHeatmap = Object.entries(allHeatmap).map(([keyCode, data]) => ({
          keyCode,
          errorFrequency: Math.round(data.total / data.count)
        }));

        this.currentStatistic = {
          id: 'average',
          childId: this.childId,
          sessionName: 'Moyenne',
          date: undefined,
          score: avgScore,
          ranking: 0,
          wordsPerMinute: avgWPM,
          mathNotionUnderstanding: avgMath,
          wordsLeastSuccessful: top5LeastSuccessful,
          precision: avgPrecision,
          heatmapData: averagedHeatmap,
          numberOfCorrections: avgCorrections,
          answersShown: avgAnswersShown,
          isTotal: true
        };
        return;
      }
    } else if (tabId === 'historique') {
      // By default, show the latest session in historique
      const sessions = this.statistics.filter(stat => stat.sessionName && stat.sessionName !== 'TOTAL');
      if (sessions.length > 0) {
        sessions.sort((a, b) => {
          const dateA = new Date(a.sessionName.replace(/^Session /, ''));
          const dateB = new Date(b.sessionName.replace(/^Session /, ''));
          return dateB.getTime() - dateA.getTime();
        });
        this.currentStatistic = sessions[0];
        return;
      }
    }
    this.currentStatistic = undefined;
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    this.setCurrentStatistic(tabId);
    if (tabId === 'historique') {
      this.historiqueSidebarOpen = false;
    }
  }

  get filteredSessions() {
    const sessions = this.statistics.filter(stat => stat.sessionName && stat.sessionName !== 'TOTAL');
    // Sort descending by date (most recent first)
    sessions.sort((a, b) => {
      const dateA = new Date(a.sessionName.replace(/^Session /, ''));
      const dateB = new Date(b.sessionName.replace(/^Session /, ''));
      return dateB.getTime() - dateA.getTime();
    });
    if (!this.searchTerm) return sessions;
    return sessions.filter(stat =>
      stat.sessionName &&
      stat.sessionName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  selectHistoriqueSession(stat: GameStatistics) {
    this.currentStatistic = stat;
    this.historiqueSidebarOpen = false;
  }
  getHeatmapColor(errorFrequency: number): string {
    if (errorFrequency === -1) {
      return 'rgba(255, 105, 180, 0.7)'; // pink, high opacity
    }
    let color = '#ffffff'; // default: white (no error)
    let alpha = Math.max(0.15, errorFrequency / 100); // always at least a bit visible

    if (errorFrequency > 0 && errorFrequency < 10) {
      color = '0,200,0'; // green
    } else if (errorFrequency >= 10 && errorFrequency < 30) {
      color = '255,215,0'; // yellow
    } else if (errorFrequency >= 30 && errorFrequency < 50) {
      color = '255,140,0'; // orange
    } else if (errorFrequency >= 50) {
      color = '255,0,0'; // red
    } else {
      // errorFrequency == 0
      return '#ffffff';
    }

    return `rgba(${color},${alpha})`;
  }
}