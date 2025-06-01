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
  public showScoreSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public backgroundBrightnessSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0.1);
  public selectedPlayerImageSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  musicEnabled$;
  effectsEnabled$;
  showScore$ = this.showScoreSubject.asObservable();
  backgroundBrightness$ = this.backgroundBrightnessSubject.asObservable();
  selectedPlayerImage$ = this.selectedPlayerImageSubject.asObservable();
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
        this.showScoreSubject.next(userData.showScore ?? true);
        this.backgroundBrightnessSubject.next(userData.backgroundBrightness ?? 0.1);
        this.selectedPlayerImageSubject.next(userData.selectedPlayerImage ?? null);
      });
  }

  setMusicEnabled(enabled: boolean) {
    if (this.userId && this.currentUser) {
      const updatedUser = { ...this.currentUser, musicEnabled: enabled };
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: any) => {
          this.musicEnabledSubject.next(userData.musicEnabled ?? enabled);
          this.currentUser = userData;
        },
        error: (err) => {
          console.error('Error updating musicEnabled:', err);
        }
      });
    }
  }

  setEffectsEnabled(enabled: boolean) {
    if (this.userId && this.currentUser) {
      const updatedUser = { ...this.currentUser, effectsEnabled: enabled };
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: any) => {
          this.effectsEnabledSubject.next(userData.effectsEnabled ?? enabled);
          this.currentUser = userData;
        },
        error: (err) => {
          console.error('Error updating effectsEnabled:', err);
        }
      });
    }
  }

  updateShowScore(showScore: boolean) {
    if (this.userId && this.currentUser) {
      const updatedUser = { ...this.currentUser, showScore };
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: any) => {
          this.showScoreSubject.next(userData.showScore ?? showScore);
          this.currentUser = userData;
        },
        error: (err) => {
          console.error('Error updating showScore:', err);
        }
      });
    }
  }

  updateBackgroundBrightness(brightness: number) {
    if (this.userId && this.currentUser) {
      const updatedUser = { ...this.currentUser, backgroundBrightness: brightness };
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: any) => {
          this.backgroundBrightnessSubject.next(userData.backgroundBrightness ?? brightness);
          this.currentUser = userData;
        },
        error: (err) => {
          console.error('Error updating backgroundBrightness:', err);
        }
      });
    }
  }

  updateSelectedPlayerImage(image: string) {
    if (this.userId && this.currentUser) {
      const updatedUser = { ...this.currentUser, selectedPlayerImage: image };
      this.http.put<any>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: any) => {
          this.selectedPlayerImageSubject.next(userData.selectedPlayerImage ?? image);
          this.currentUser = userData;
        },
        error: (err) => {
          console.error('Error updating selectedPlayerImage:', err);
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
      const updatedUser = { ...this.currentUser, musicEnabled, effectsEnabled };
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
