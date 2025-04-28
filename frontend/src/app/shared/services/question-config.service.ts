import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {LocalStorageService} from "./localStorage.service";
import { UserService } from './user.service';
import { User } from '../models/user.model';


export interface QuestionConfig {
  addition: boolean;
  rewrite: boolean;
  crypted: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
  equations: boolean;
  leaderboard: boolean;
  advancedStats: boolean;
  showAnswers: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class QuestionConfigService {
  private readonly STORAGE_KEY_PREFIX = 'question_config_user_';
  private configSubject = new BehaviorSubject<QuestionConfig>(this.getDefaultConfig());
  private currentUser: User | null = null;


  constructor(private localStorage: LocalStorageService,
              private userService: UserService)
  {

    this.userService.selectedUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        // Load the configuration for this specific user
        this.loadConfigForUser(user.userId);
      }
    });
  }

  private getDefaultConfig(): QuestionConfig {
    return {
      addition: false,
      rewrite: true,
      crypted: false,
      subtraction: false,
      multiplication: false,
      division: false,
      equations: false,
      leaderboard: false,
      advancedStats: false,
      showAnswers: false
    };
  }

  private getStorageKey(userId: string): string {
    return `${this.STORAGE_KEY_PREFIX}${userId}`;
  }


  private loadConfigForUser(userId: string): void {
    try {
      const storageKey = this.getStorageKey(userId);
      const savedConfig = this.localStorage.getData(storageKey);
      console.log(`Loading configuration for user ${userId}:`, savedConfig);

      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        if (this.isValidConfig(parsedConfig)) {
          this.configSubject.next(parsedConfig);
          return;
        }
      }

      // If no valid saved config, convert from user's existing config if available
      if (this.currentUser?.userConfig) {
        const convertedConfig = this.convertFromUserConfig(this.currentUser.userConfig);
        this.configSubject.next(convertedConfig);
        return;
      }

      // Use default config as fallback
      this.configSubject.next(this.getDefaultConfig());
    } catch (error) {
      console.error('Error loading user configuration:', error);
      this.configSubject.next(this.getDefaultConfig());
    }
  }

// Convert from the user's existing config structure to QuestionConfig format
  private convertFromUserConfig(userConfig: any): QuestionConfig {
    return {
      addition: userConfig.addition || false,
      subtraction: userConfig.substraction || false, // Note the spelling difference
      multiplication: userConfig.multiplication || false,
      division: userConfig.division || false,
      rewrite: userConfig.rewriting || false, // Name difference
      crypted: userConfig.encryption || false, // Name difference
      showAnswers: userConfig.showsAnswer || false, // Name difference
      equations: false, // Default values for fields not in userConfig
      leaderboard: false,
      advancedStats: false
    };
  }

  private isValidConfig(config: any): boolean {
    // Check if the object has all required properties
    const requiredProps = [
      'addition', 'rewrite', 'crypted', 'subtraction',
      'multiplication', 'division', 'equations',
      'leaderboard', 'advancedStats', 'showAnswers'
    ];

    return requiredProps.every(prop => typeof config[prop] === 'boolean');
  }




  public getConfig(): Observable<QuestionConfig> {
    return this.configSubject.asObservable();
  }

  public getCurrentConfig(): QuestionConfig {
    return this.configSubject.getValue();
  }

  public updateNotion(notion: keyof QuestionConfig, value: boolean): void {
    if (!this.currentUser) {
      console.error('Cannot update configuration: No user selected');
      return;
    }

    const currentConfig = this.configSubject.getValue();
    const newConfig = { ...currentConfig, [notion]: value };

    this.configSubject.next(newConfig);
    this.saveConfig(newConfig);
  }

  public updateConfig(config: QuestionConfig): void {
    if (!this.currentUser) {
      console.error('Cannot update configuration: No user selected');
      return;
    }

    this.configSubject.next(config);
    this.saveConfig(config);
  }

  private saveConfig(config: QuestionConfig): void {
    if (!this.currentUser) return;

    const storageKey = this.getStorageKey(this.currentUser.userId);
    console.log(`Saving configuration for user ${this.currentUser.userId}:`, config);
    this.localStorage.saveData(storageKey, JSON.stringify(config));
  }
}


