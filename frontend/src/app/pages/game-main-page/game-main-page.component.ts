import { Component } from '@angular/core';
import { Injectable, OnInit } from '@angular/core';
import {ConfigService} from '../../shared/services/config.service';
@Component({
  selector: 'app-game-main',
  templateUrl: './game-main-page.component.html',
  styleUrl: './game-main-page.component.scss'
})

@Injectable({
  providedIn: 'root'
})

export class GameMainComponent implements OnInit{
  currentWord: string = "Tortue";
  userInput: string = '';
  points: number = 0;
  isCorrect: boolean | null = null;
  selectedFont: string = 'Arial';

  words: string[] = ['Tortue', 'Chien', 'Chat', 'Oiseau', 'Poisson', 'Lapin', 'Souris', 'Serpent', 'Tigre', 'Lion'];
  wordIndex: number = 0;

  constructor(private configService: ConfigService) {}
  
  checkWord(){
    if(this.userInput == this.currentWord){
      this.isCorrect = true;
      this.points += 5;
      this.nextWord();
    }else{
      this.isCorrect = false;
    }
  }

  nextWord(){
    this.wordIndex = (this.wordIndex + 1) % this.words.length;
    this.currentWord = this.words[this.wordIndex];
    //reset
    this.userInput = '';
    this.isCorrect = null;
  }

  ngOnInit(){
      this.configService.selectedFont$.subscribe((font) => {
        this.selectedFont = font;
    });
  }
}
