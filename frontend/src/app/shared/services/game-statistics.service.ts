// src/app/shared/services/game-statistics.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { GameStatistics } from '../models/game-statistics.model';
import { tap, catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameStatisticsService {
  private apiUrl = environment.apiUrl+'/game-statistics';
  private readonly STATS_STORAGE_KEY = 'game_statistics';
  private statisticsSubject = new BehaviorSubject<GameStatistics[]>([]);
  public statistics$ = this.statisticsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.http.get<GameStatistics[]>(this.apiUrl)
      .pipe(
        tap(statistics => {
          statistics.forEach(stat => {
            if (stat.date) {
              stat.date = new Date(stat.date);
            }
          });
          this.statisticsSubject.next(statistics);
        }),
        catchError(error => {
          console.error('Error loading statistics:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  saveGameSession(gameStats: GameStatistics): Observable<GameStatistics> {
    console.log('[SERVICE] Posting gameStats to backend:', JSON.stringify(gameStats, null, 2));

    return this.http.post<GameStatistics>(this.apiUrl, gameStats)
      .pipe(
        tap(savedStats => {
          console.log('[SERVICE] Received savedStats from backend:', savedStats);

          const currentStats = this.statisticsSubject.value;
          this.statisticsSubject.next([...currentStats, savedStats]);
        }),
        catchError(error => {
          console.error('Error saving game session:', error);
          return of(gameStats);
        })
      );
  }

  getAllStatistics(): Observable<GameStatistics[]> {
    return this.statistics$;
  }

  getStatisticsForChild(childId: string): Observable<GameStatistics[]> {
    return this.http.get<GameStatistics[]>(`${this.apiUrl}/child/${childId}`)
      .pipe(
        tap(statistics => {
          statistics.forEach(stat => {
            if (stat.date) {
              stat.date = new Date(stat.date);
            }
          });
        }),
        catchError(error => {
          console.error(`Error loading statistics for child ${childId}:`, error);
          return of([]);
        })
      );
  }

  getTotalForChild(childId: string): Observable<GameStatistics | undefined> {
    return this.getStatisticsForChild(childId).pipe(
      map(stats => stats.find(stat => stat.isTotal))
    );
  }
}
