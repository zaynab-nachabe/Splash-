import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Avatar } from '../models/avatar.model';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChildConfigService {
  private apiUrl = environment.apiUrl+'/users';
  private musicEnabledSubject: BehaviorSubject<boolean>;
  private effectsEnabledSubject: BehaviorSubject<boolean>;
  public showScoreSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public selectedPlayerImageSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private crabSpeedSubject: BehaviorSubject<string> = new BehaviorSubject<string>('slow');
  private limitedLivesSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  musicEnabled$;
  effectsEnabled$;
  showScore$ = this.showScoreSubject.asObservable();
  selectedPlayerImage$ = this.selectedPlayerImageSubject.asObservable();
  crabSpeed$ = this.crabSpeedSubject.asObservable();
  limitedLives$ = this.limitedLivesSubject.asObservable();
  private userId: string | null = null;
  private currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
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
        this.selectedPlayerImageSubject.next(userData.selectedPlayerImage ?? null);
        this.crabSpeedSubject.next(userData.crabSpeed ?? 'slow');
        this.limitedLivesSubject.next(userData.limitedLives ?? true);
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

  updateSelectedPlayerImage(image: string) {
    if (this.userId && this.currentUser) {
      console.log('current user:', this.currentUser);
      console.log('updating selected player image:', image);
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

  updateCrabSpeed(speed: 'slow' | 'fast') {
    if (this.userId && this.currentUser) {
      const updatedUser = {
        ...this.currentUser,
        crabSpeed: speed,
        // Ensure required fields are present
        userId: this.currentUser.userId,
        name: this.currentUser.name,
        age: this.currentUser.age,
        icon: this.currentUser.icon,
        conditions: this.currentUser.conditions || [],
        userConfig: this.currentUser.userConfig || {}
      };

      this.http.put<User>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: User) => {
          this.crabSpeedSubject.next(userData.crabSpeed || 'slow');
          this.currentUser = userData;
        },
        error: (err) => {
          console.error('Error updating crab speed:', err);
          this.crabSpeedSubject.next(this.currentUser?.crabSpeed || 'slow');
        }
      });
    }
  }

  updateLimitedLives(enabled: boolean) {
    if (this.userId && this.currentUser) {
      const updatedUser = { ...this.currentUser, limitedLives: enabled };
      this.http.put<User>(`${this.apiUrl}/${this.userId}`, updatedUser).subscribe({
        next: (userData: User) => {
          this.limitedLivesSubject.next(userData.limitedLives ?? enabled);
          this.currentUser = userData;
        },
        error: (err) => console.error('Error updating limitedLives:', err)
      });
    }
  }

  getMusicEnabled(): boolean {
    return this.musicEnabledSubject.value;
  }

  getEffectsEnabled(): boolean {
    return this.effectsEnabledSubject.value;
  }

  getLimitedLives(): boolean {
    return this.limitedLivesSubject.value;
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

  /*
  purchaseAvatar(avatar: Avatar): Observable<User> {
    if (this.userId && this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        money: Number(this.currentUser.money || 0) - avatar.price,
        unlockedAvatars: [...(this.currentUser.unlockedAvatars || []), avatar.id],
        selectedPlayerImage: avatar.path,
        userConfig: this.currentUser.userConfig || {},
        icon: this.currentUser.icon || '',
        conditions: this.currentUser.conditions || []
      };

      this.userService.updateUser(updatedUser);
      
      return this.http.put<User>(`${this.apiUrl}/${this.userId}`, updatedUser).pipe(
        tap((userData: User) => {
          this.currentUser = userData;
          this.selectedPlayerImageSubject.next(avatar.path);
          this.userService.selectUser(userData.userId);
        })
      );
    }
    return EMPTY;
  }
    */

  purchaseAvatar(avatar: Avatar): Observable<User> {
  if (this.userId) {
    // Fetch latest user before updating, then update and return the result of the PUT
    return this.http.get<User>(`${this.apiUrl}/${this.userId}`).pipe(
      switchMap((latestUser: User) => {
        const updatedUser: User = {
          ...latestUser,
          money: Number(latestUser.money || 0) - avatar.price,
          unlockedAvatars: Array.from(new Set([...(latestUser.unlockedAvatars || []), avatar.id])),
          selectedPlayerImage: avatar.path
        };
        return this.http.put<User>(`${this.apiUrl}/${this.userId}`, updatedUser).pipe(
          tap((userData: User) => {
            this.currentUser = userData;
            this.selectedPlayerImageSubject.next(avatar.path);
          })
        );
      })
    );
  }
  return EMPTY;
}

  isAvatarUnlocked(avatarId: string): boolean {
    return this.currentUser?.unlockedAvatars?.includes(avatarId) || avatarId === 'yellow_fish';
  }
}
