import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import {UserConfig} from "../models/user-config.model";

/*
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
  word: boolean;
}
*/


@Injectable({
  providedIn: 'root'
})
export class QuestionConfigService {
  private configSubject: BehaviorSubject<UserConfig>;
  private currentUser!: User;

  constructor(private userService: UserService) {
    this.configSubject = new BehaviorSubject<UserConfig>(this.getDefaultConfig());

    this.userService.selectedUser$.subscribe(user => {
      if (!user) {
        throw new Error('No user selected in QuestionConfigService');
      }
      this.currentUser = user;
      const config = user.userConfig ?? this.getDefaultConfig();
      this.configSubject.next(config);
    });
  }

  private getDefaultConfig(): UserConfig {
      return {
        showAnswer: false,
        addition: false,
        subtraction: false,
        multiplication: false,
        division: false,
        rewrite: true,
        encryption: false,
        word: false,
        showScore: false,
        nombresDeQuestion: 10 // or any sensible default
      };
  }


  public getConfig(): Observable<UserConfig> {
    return this.configSubject.asObservable();
  }

  public getCurrentConfig(): UserConfig {
    return this.configSubject.getValue();
  }

public updateNotion(notion: keyof UserConfig, value: any): void {
    if (!this.currentUser) {
      throw new Error('Cannot update configuration: No user selected');
    }
    const currentConfig = this.configSubject.getValue();
    const newConfig = { ...currentConfig, [notion]: value } as UserConfig;
    this.configSubject.next(newConfig);
    this.currentUser.userConfig = newConfig;
    this.userService.updateUser(this.currentUser); // Persist to backend via UserService
  }

  public updateConfig(config: UserConfig): void {
    if (!this.currentUser) {
      throw new Error('Cannot update configuration: No user selected');
    }
    this.currentUser.userConfig = config;
    this.configSubject.next(config);
    this.userService.updateUser(this.currentUser); // Persist to backend via UserService
    console.log('Configuration updated:', config);
  }
}


