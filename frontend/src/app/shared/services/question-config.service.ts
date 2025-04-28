import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {LocalStorageService} from "./localStorage.service";

@Injectable({
  providedIn: 'root'
})
export class QuestionConfigService {
  private readonly STORAGE_KEY = 'question_config';
  private configSubject: BehaviorSubject<QuestionConfig>;

  constructor(private localStorage: LocalStorageService) {
    const initialConfig = this.loadConfig();
    console.log('Service Constructor - Initial config:', initialConfig);

    this.configSubject = new BehaviorSubject<QuestionConfig>(initialConfig);
    // Ensure config is saved immediately
    this.saveConfig(initialConfig);
  }


  private loadConfig(): QuestionConfig {
    try {
      const savedConfig = this.localStorage.getData(this.STORAGE_KEY);
      console.log('Loading from localStorage:', savedConfig);

      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        console.log('Parsed saved config:', parsedConfig);

        if (this.isValidConfig(parsedConfig)) {
          return parsedConfig;
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    const defaultConfig = {
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

    console.log('Using default config:', defaultConfig);
    return defaultConfig;

  }

  private isValidConfig(config: any): config is QuestionConfig {
    return typeof config === 'object' &&
      typeof config.addition === 'boolean' &&
      typeof config.rewrite === 'boolean' &&
      typeof config.crypted === 'boolean' &&
      typeof config.subtraction === 'boolean' &&
      typeof config.multiplication === 'boolean' &&
      typeof config.division === 'boolean' &&
      typeof config.equations === 'boolean' &&
      typeof config.leaderboard === 'boolean' &&
      typeof config.advancedStats === 'boolean' &&
      typeof config.showAnswers === 'boolean';
  }



  private saveConfig(config: QuestionConfig): void {
    try {
      console.log('Saving config to localStorage:', config);
      this.localStorage.saveData(this.STORAGE_KEY, JSON.stringify(config));
      this.configSubject.next({ ...config });

      // Verify the save
      const savedConfig = this.localStorage.getData(this.STORAGE_KEY);
      console.log('Verified saved config:', savedConfig);


    } catch (error) {
      console.error('Error saving config:', error);
    }

  }


  // Get the current configuration as an Observable
  getConfig(): Observable<QuestionConfig> {
    return this.configSubject.asObservable();
  }

  // Get the current configuration value
  getCurrentConfig(): QuestionConfig {
    const currentConfig = this.configSubject.getValue();
    console.log('Getting current config:', currentConfig);
    return currentConfig;

  }

  updateConfig(config: Partial<QuestionConfig>): void {
    console.log('Updating config with:', config);

    const currentConfig = this.getCurrentConfig();
    const newConfig = {
      ...currentConfig,
      ...config
    };
    console.log('New merged config:', newConfig);

    this.saveConfig(newConfig);
  }



  updateNotion(notion: keyof QuestionConfig, value: boolean): void {
    console.log(`Updating notion ${notion} to:`, value);

    const currentConfig = this.getCurrentConfig();
    const newConfig = {
      ...currentConfig,
      [notion]: value
    };
    console.log('New config after notion update:', newConfig);

    this.saveConfig(newConfig);
  }

}

export interface QuestionConfig {
  showAnswers: boolean;
  advancedStats: boolean;
  leaderboard: boolean;
  addition: boolean;
  rewrite: boolean;
  crypted: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
  equations: boolean;
}
