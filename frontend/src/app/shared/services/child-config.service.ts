import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ChildConfigService {
  private apiUrl = 'http://localhost:9428/api/users';
  private musicEnabledSubject: BehaviorSubject<boolean>;
  private effectsEnabledSubject: BehaviorSubject<boolean>;

  musicEnabled$;
  effectsEnabled$;
  private userId: string | null = null;
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    this.musicEnabledSubject = new BehaviorSubject<boolean>(true);
    this.effectsEnabledSubject = new BehaviorSubject<boolean>(true);
    this.musicEnabled$ = this.musicEnabledSubject.asObservable();
    this.effectsEnabled$ = this.effectsEnabledSubject.asObservable();
  }

  loadUserConfig(user: User) {
    this.userId = user.userId;
    this.http.get<any>(`${this.apiUrl}/${this.userId}`)
      .subscribe((userData) => {
        this.currentUser = userData;
        this.musicEnabledSubject.next(userData.musicEnabled ?? true);
        this.effectsEnabledSubject.next(userData.effectsEnabled ?? true);
      });
  }

  setMusicEnabled(enabled: boolean) {
    if (this.userId) {
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, { musicEnabled: enabled }).subscribe({
        next: (userData: any) => {
          this.musicEnabledSubject.next(userData.musicEnabled ?? enabled);
        },
        error: (err) => {
          console.error('Error updating musicEnabled:', err);
        }
      });
    }
  }

  setEffectsEnabled(enabled: boolean) {
    if (this.userId) {
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, { effectsEnabled: enabled }).subscribe({
        next: (userData: any) => {
          this.effectsEnabledSubject.next(userData.effectsEnabled ?? enabled);
        },
        error: (err) => {
          console.error('Error updating effectsEnabled:', err);
        }
      });
    }
  }

  getMusicEnabled(): boolean {
    return this.musicEnabledSubject.value;
  }

  getEffectsEnabled(): boolean {
    return this.effectsEnabledSubject.value;
  }

  updateToggles(musicEnabled: boolean, effectsEnabled: boolean) {
    if (this.userId && this.currentUser) {
      // Defensive: ensure userConfig has all required fields
      const defaultUserConfig = {
        showsAnswer: false,
        addition: false,
        subtraction: false,
        multiplication: false,
        division: false,
        rewrite: false,
        encryption: false,
        word: false
      };
      const safeUserConfig = { ...defaultUserConfig, ...this.currentUser.userConfig };
      const updatedUser = { ...this.currentUser, musicEnabled, effectsEnabled, userConfig: safeUserConfig };
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: any) => {
          this.musicEnabledSubject.next(userData.musicEnabled ?? musicEnabled);
          this.effectsEnabledSubject.next(userData.effectsEnabled ?? effectsEnabled);
          this.currentUser = userData;
        },
        error: (err) => {
          console.error('Error updating toggles:', err);
        }
      });
    }
  }
}
