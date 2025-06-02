import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Question } from 'src/app/shared/models/question.model';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { GameEngine } from './game-engine';
import { FontService } from 'src/app/shared/services/font.service';
import { GameStatisticsService } from '../../../shared/services/game-statistics.service';
import {QuestionConfigService} from "../../../shared/services/question-config.service";
import {Subscription} from "rxjs";
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/shared/services/question.service';
import { UserConfig } from 'src/app/shared/models/user-config.model';
import { ChildConfigService } from 'src/app/shared/services/child-config.service';


type Input = {
  letter: string,
  status: "correct" | "wrong" | "pending",
};



////////////////////////////////////////////////////////////////////////////////
// Game :
////////////////////////////////////////////////////////////////////////////////

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameMusic', { static: false }) gameMusicRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private static readonly INPUTS_END = { letter: '\xa0', status: "pending" };

  private configSubscription: Subscription;
  private musicSubscription: Subscription;
  private brightnessSubscription: Subscription;
  public fontFamily: string = 'Arial';
  public user!: User;
  public question!: Question;
  private keydownHandler: (event: KeyboardEvent) => void;

  public expected_answerInputs: string[] = [];
  public proposed_answerInputs: string[] = [];
  public inputs: { letter: string, status: "correct" | "wrong" | "pending" }[] = [];

  public cursorPosition: number = 0;
  public score: number = 0;
  private hasEnded: boolean = false;

  private gameEngine!: GameEngine;

  private questionCount: number = -1;
  private MaxQuestions: number = 10;

  public backgroundBrightness: number = 0.8;
  public showPreGameLobby: boolean = false;

  constructor(
    private userService: UserService,
    private questionConfigService: QuestionConfigService,
    private fontService: FontService,
    private router: Router,
    private questionService: QuestionService,
    private gameStatisticsService: GameStatisticsService,
    private childConfigService: ChildConfigService,
    private route: ActivatedRoute
  ) {
    this.userService.selectedUser$.subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.MaxQuestions = user.userConfig.nombresDeQuestion ?? 10;
        this.childConfigService.loadUserConfig(this.user);
      } else {
        // Handle the case where no user is selected, e.g. redirect or show a message
        console.warn('No user selected in game.');
      }
    });

    this.fontService.selectedFont$.subscribe((font) => {
      console.log('Font updated in GameComponent:', font);
      this.fontFamily = font;
    });

    this.configSubscription = this.questionConfigService.getConfig().subscribe(() => {
      this.loadNewQuestion();
    });

    this.route.queryParams.subscribe(params => {
      if (params['preGameLobby'] === 'true') {
        this.showPreGameLobby = true;
      }
    });

    this.loadNewQuestion();

    this.keydownHandler = this.checkInput.bind(this);

    this.musicSubscription = this.childConfigService.musicEnabled$.subscribe((enabled: boolean) => {
      if (this.gameMusicRef && this.gameMusicRef.nativeElement) {
        const audio = this.gameMusicRef.nativeElement;
        if (enabled) {
          audio.pause();
          audio.currentTime = 0; // Reset to the beginning
          setTimeout(() => {
            audio.muted = false; // Unmute after a short delay
            audio.play().catch(() => { });
          }, 0); // Let pause finish before play
        } else {
          audio.pause();
          audio.currentTime = 0; // Reset to the beginning
          audio.muted = true;
        }
      }
    });

    this.brightnessSubscription = this.childConfigService.backgroundBrightness$.subscribe((brightness: number) => {
      this.backgroundBrightness = brightness;
      if (this.gameEngine) {
        this.gameEngine.setBackgroundBrightness(brightness);
      }
    });
  }

  ngOnInit(): void {
    this.questionCount = -1; //OPTIONAL TO TEST
    document.addEventListener("keydown", this.keydownHandler);
    this.updateInputs();
    // Do not start the game if pre-game lobby is shown
    if (!this.showPreGameLobby) {
      this.loadNewQuestion();
    }
  }

  ngAfterViewInit(): void {
    if (this.user) {
      this.childConfigService.loadUserConfig(this.user);
    }
    const canvas = this.canvasRef.nativeElement;
    this.gameEngine = new GameEngine(this, canvas, this.fontService, this.childConfigService);
    this.gameEngine.setBackgroundBrightness(this.backgroundBrightness);
    //this.startMusic();
  }

  ngOnDestroy(): void {
    document.removeEventListener("keydown", this.keydownHandler);
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    if (this.musicSubscription) {
      this.musicSubscription.unsubscribe();
    }
    if (this.brightnessSubscription) {
      this.brightnessSubscription.unsubscribe();
    }
    this.stopMusic();
  }

  private startMusic(): void {
    const audioElement = this.gameMusicRef.nativeElement;
    // Only play music if music is enabled
    if (this.childConfigService.getMusicEnabled()) {
      audioElement.pause(); // Reset audio playback
      audioElement.currentTime = 0; // Reset to the beginning
      audioElement.play().catch((error) => {
        console.error('Error playing music:', error);
      });
    } else {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  }

  private stopMusic(): void {
    const audioElement = this.gameMusicRef.nativeElement;
    audioElement.pause();
    audioElement.currentTime = 0;
  }

  private loadNewQuestion(): void {
    if (this.hasEnded) {
      console.log("Game has ended, not loading new question.");
      return;
    }
    if (this.questionCount >= this.MaxQuestions) {
      console.log("Maximum number of questions reached, ending game.");
      this.endGame();
      return;
    }

    console.log("Requesting new question");
    if (!this.user) {
      console.log("No user selected, cannot load new question.");
      return;
    }
    const userConfig: UserConfig = this.user.userConfig; // Get user configuration
    this.questionService.generateQuestion(userConfig).subscribe(
      (question) => {
        console.log("Received question from backend:", question);

        this.question = question; // Set the new question
        this.expected_answerInputs = this.question.answer.split('');
        this.proposed_answerInputs = [];
        this.updateInputs();
        this.questionCount++;
      },
      (error) => {
        console.error('Error fetching question:', error);
        this.hasEnded = true; // End the game if question generation fails
      }
    );
  }

  private updateInputs(): void {
    const showsAnswer = this.questionConfigService.getCurrentConfig()?.showAnswer ?? false;
    const PENDING_SPACE: Input = { letter: '\xa0', status: "pending" };
    const CORRECT_SPACE: Input = { letter: '\xa0', status: "correct" };
    const WRONG_SPACE: Input = { letter: '·', status: "wrong" };

    const ret: Input[] = [];
    const LENGTH = Math.max(this.proposed_answerInputs.length, this.expected_answerInputs.length);

    for (let i = 0; i < LENGTH; i++) {
      const proposed_letter = this.proposed_answerInputs[i];
      const expected_letter = this.expected_answerInputs[i];

      if (proposed_letter === expected_letter) {
        ret[i] = proposed_letter !== ' ' ? { letter: proposed_letter, status: "correct" } : CORRECT_SPACE;
      } else if (proposed_letter === undefined) {
        if (!showsAnswer) break;
        ret[i] = expected_letter !== ' ' ? { letter: expected_letter, status: "pending" } : PENDING_SPACE;
      } else {
        ret[i] = proposed_letter !== ' ' ? { letter: proposed_letter, status: "wrong" } : WRONG_SPACE;
      }
    }

    ret.push(GameComponent.INPUTS_END as Input); // Explicitly cast INPUTS_END to Input
    this.inputs = ret;
  }

  private gotoStart(): void {
    this.cursorPosition = 0;
  }
  private goToEnd(): void {
    this.cursorPosition = this.proposed_answerInputs.length;
  }

  private moveToTheLeft(): void {
    if (this.cursorPosition == 0)
      return;
    this.cursorPosition--;
  }

  private moveToTheRight(): void {
    if (this.cursorPosition == this.proposed_answerInputs.length)
      return;
    this.cursorPosition++;
  }


  private deleteCurrentCharacter(): void {
    if (this.cursorPosition == this.proposed_answerInputs.length)
      return;
    this.proposed_answerInputs.splice(this.cursorPosition, 1);
    this.updateInputs();
  }

  private deletePreviousCharacter(): void {
    if (this.cursorPosition == 0)
      return;

    this.cursorPosition--;
    this.proposed_answerInputs.splice(this.cursorPosition, 1);
    this.updateInputs();
  }

  private submitAnswer(): void {
    if (AnswerChecker.checkAnswer(this.proposed_answerInputs, this.expected_answerInputs)) {
      this.score += 10;
      this.gameEngine.score = this.score;
      this.gameEngine.answerCorrectly();
    } else {
      this.gameEngine.answerIncorrectly(this.proposed_answerInputs.join(''));
    }
    //review logic
    this.loadNewQuestion();
    if (!this.question) {
      this.endGame();
      return;
    }


    // Reset answer inputs
    this.expected_answerInputs = this.question.answer.split("");
    this.proposed_answerInputs = [];
    this.cursorPosition = 0;
  }
  /*
  private writeCharacter(c: string): void {
      this.proposed_answerInputs.splice(
          this.cursorPosition++, 0, c
      );
      this.updateInputs();
  }
  */

  private writeCharacter(c: string): void {
    // Check if the character is wrong at the current position
    const expected = this.expected_answerInputs[this.cursorPosition];
    if (expected && c !== expected) {
      // Log the error to the game engine's errorsByKey map
      const key = `Key${expected.toUpperCase()}`;
      this.gameEngine.logKeyError(key);
    }

    this.proposed_answerInputs.splice(
      this.cursorPosition++, 0, c
    );
    this.updateInputs();
  }


  private checkInput(event: KeyboardEvent): void {
    const keyPressed = event.key;

    switch (keyPressed) {
      case "Home":
        this.gotoStart();
        break;

      case "End":
        this.goToEnd();
        break;

      case "ArrowLeft":
        this.moveToTheLeft();
        break;

      case "ArrowRight":
        this.moveToTheRight();
        break;

      case "Delete":
        this.deleteCurrentCharacter();
        break;

      case "Backspace":
        this.deletePreviousCharacter();
        break;

      case "Enter":
        this.submitAnswer();
        break;

      default:
        if (keyPressed.length === 1) {
          this.writeCharacter(keyPressed);
        }
        break;
    }
    //break;
  }

  private showAnswer(): void {
    // Whatever logic you use to show answers
    this.gameEngine.showAnswer();
  }

    private endGame(): void {
        this.hasEnded = true;
        this.stopMusic();
        // Get statistics from game engine
        const gameStats = this.gameEngine.getGameStatistics(this.user.userId);
        // Save to statistics service
        this.gameStatisticsService.saveGameSession(gameStats).subscribe(
            (savedStats) => {
                console.log('Game statistics saved successfully', savedStats);
                this.userService.setScore(this.score);
                this.router.navigate(['/game-podium'], {
                    queryParams: {
                        user: JSON.stringify(this.user),
                        questionsAnswered: this.questionCount,
                        score: this.score
                    }
                });
            },
            (error) => {
                console.error('Failed to save game statistics', error);
                // Navigate to podium anyway
                this.userService.setScore(this.score);
                this.router.navigate(['/game-podium'], {
                    queryParams: {
                        user: JSON.stringify(this.user),
                        questionsAnswered: this.questionCount,
                        score: this.score
                    }
                });
            }
        );
    }

    startGame() {
      this.showPreGameLobby = false;
      this.loadNewQuestion();
    }
}

class AnswerChecker {
  public static checkAnswer(proposed_answer: string[], expected_answer: string[]): boolean {
    if (proposed_answer.length !== expected_answer.length) {
      return false;
    }

    for (let i = 0; i < proposed_answer.length; i++) {
      if (proposed_answer[i] !== expected_answer[i]) {
        return false;
      }
    }
    return true;
  }
}



