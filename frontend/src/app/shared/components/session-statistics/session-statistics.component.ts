import { Component, Input } from '@angular/core';
import { GameStatistics } from 'src/app/shared/models/game-statistics.model';

@Component({
  selector: 'app-session-statistics',
  templateUrl: './session-statistics.component.html',
  styleUrls: ['./session-statistics.component.scss']
})
export class SessionStatisticsComponent {
  @Input() currentStatistic!: GameStatistics;

  getHeatmapColor(errorFrequency: number): string {
    // Strong contrast: 0 = white, 100 = deep red
    const intensity = Math.min(255, Math.round(errorFrequency * 2.55));
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  }
}