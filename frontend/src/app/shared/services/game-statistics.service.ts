// src/app/shared/services/game-statistics.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GameStatistics } from '../models/game-statistics.model';
import {
  GAME_STATISTICS_MOCK,
  getChildStatistics,
  getChildSession,
  getChildTotal
} from '../mocks/game-statistics.mock';

@Injectable({
  providedIn: 'root'
})
export class GameStatisticsService {

  constructor() { }

  // Get all statistics
  getAllStatistics(): Observable<GameStatistics[]> {
    return of(GAME_STATISTICS_MOCK);
  }

  // Get all statistics for a specific child
  getStatisticsForChild(childId: string): Observable<GameStatistics[]> {
    return of(getChildStatistics(childId));
  }

  // Get a specific session for a child
  getSessionForChild(childId: string, sessionName: string): Observable<GameStatistics | undefined> {
    return of(getChildSession(childId, sessionName));
  }

  // Get the total/average statistics for a child
  getTotalForChild(childId: string): Observable<GameStatistics | undefined> {
    return of(getChildTotal(childId));
  }
}
