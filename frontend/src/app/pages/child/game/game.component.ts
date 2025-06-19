import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Question } from 'src/app/shared/models/question.model';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { GameEngine } from './game-engine';
import { FontService } from 'src/app/shared/services/font.service';
import { GameStatisticsService } from '../../../shared/services/game-statistics.service';
import { QuestionConfigService } from "../../../shared/services/question-config.service";
import { Subscription } from "rxjs";
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/shared/services/question.service';
import { UserConfig } from 'src/app/shared/models/user-config.model';
import { ChildConfigService } from 'src/app/shared/services/child-config.service';
import { WordStats } from 'src/app/shared/models/game-statistics.model';
import { QuestionNotion } from 'src/app/shared/models/QuestionGenerationUtils/QuestionNotionEnum';

type Input = {
  letter: string,
  status: "correct" | "wrong" | "pending" | "neutral",
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
  public fontFamily: string = 'Arial';
  public user!: User;
  public question!: Question;
  private keydownHandler: (event: KeyboardEvent) => void;
  private enterTimeoutActive: boolean = false;

  private wordAttempts: { [word: string]: string[] } = {};

  public expected_answerInputs: string[] = [];
  public proposed_answerInputs: string[] = [];
  public inputs: { letter: string, status: "correct" | "wrong" | "pending" | "neutral" }[] = [];

  public cursorPosition: number = 0;
  public score: number = 0;
  private hasEnded: boolean = false;

  private gameEngine!: GameEngine;

  public questionCount: number = -2;
  public MaxQuestions: number = 10;
  public showPreGameLobby: boolean = false;


  public lives: number = 5;
  limitedLives: boolean = true;

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
          audio.currentTime = 0;
          setTimeout(() => {
            audio.muted = false;
            audio.play().catch(() => { });
          }, 0);
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = true;
        }
      }
    });

    this.childConfigService.limitedLives$.subscribe((val: boolean) => {
      this.limitedLives = val;
      if (this.gameEngine) {
        this.gameEngine.setLimitedLives(val);
      }
    });
  }

  ngOnInit(): void {
    this.questionCount = -1;
    document.addEventListener("keydown", this.keydownHandler);
    this.updateInputs();
    if (!this.showPreGameLobby) {
      this.loadNewQuestion();
    }
    this.lives = this.gameEngine ? this.gameEngine.lives : 5;
    (window as any).gameEngine = this.gameEngine;
  }

  ngAfterViewInit(): void {
    if (this.user) {
      this.childConfigService.loadUserConfig(this.user);
    }
    const canvas = this.canvasRef.nativeElement;
    this.gameEngine = new GameEngine(this, canvas, this.fontService, this.childConfigService);
    //this.startMusic();

    this.gameEngine.onLivesChanged = (lives: number) => {
      this.lives = lives;
      if (lives <= 0) {
        this.endGame();
      }
    };
  }

  ngOnDestroy(): void {
    document.removeEventListener("keydown", this.keydownHandler);
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    if (this.musicSubscription) {
      this.musicSubscription.unsubscribe();
    }
    this.stopMusic();
  }

  private startMusic(): void {
    const audioElement = this.gameMusicRef.nativeElement;
    if (this.childConfigService.getMusicEnabled()) {
      audioElement.pause();
      audioElement.currentTime = 0;
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
    const userConfig: UserConfig = this.user.userConfig;
    this.questionService.generateQuestion(userConfig).subscribe(
      (question) => {
        console.log("Received question from backend:", question);

        this.question = question;
        this.expected_answerInputs = this.question.answer.split('');

        if (this.gameEngine && this.expected_answerInputs) {
          this.expected_answerInputs.forEach(letter => {
            if (letter && letter.trim() !== '') {
              const key = `Key${letter.toUpperCase()}`;
              this.gameEngine.incrementKeyAppearance(key);
            }
          });
        }
        this.proposed_answerInputs = [];
        this.updateInputs();
        this.questionCount++;
      },
      (error) => {
        console.error('Error fetching question:', error);
        this.hasEnded = true;
      }
    );
  }



  private updateInputs(): void {
    const showsAnswer = this.questionConfigService.getCurrentConfig()?.showAnswer ?? false;
    const showLetterColor = this.user?.userConfig?.showLetterColor ?? true;


    const PENDING_SPACE: Input = { letter: '\xa0', status: "pending" };
    const CORRECT_SPACE: Input = { letter: '\xa0', status: "correct" };
    const WRONG_SPACE: Input = { letter: '·', status: "wrong" };

    const ret: Input[] = [];
    const LENGTH = Math.max(this.proposed_answerInputs.length, this.expected_answerInputs.length);

    for (let i = 0; i < LENGTH; i++) {
      const proposed_letter = this.proposed_answerInputs[i];
      const expected_letter = this.expected_answerInputs[i];

      if (proposed_letter === undefined) {
        // Before user types
        if (showsAnswer) {
          // Show expected letter in grey (pending)
          if (expected_letter !== ' ') {
            ret[i] = { letter: expected_letter, status: "pending" };
          } else {
            ret[i] = PENDING_SPACE;
          }
        }
        else {
          break;
        }
      } else {
        if (showLetterColor) {
          if (proposed_letter === expected_letter) {
            ret[i] = proposed_letter !== ' ' ? { letter: proposed_letter, status: "correct" } : CORRECT_SPACE;
          } else {
            ret[i] = proposed_letter !== ' ' ? { letter: proposed_letter, status: "wrong" } : WRONG_SPACE;
          }
        } else {
          ret[i] = proposed_letter !== ' ' ? { letter: proposed_letter, status: "neutral" } : { letter: '\xa0', status: "neutral" };
        }
      }
    }

    ret.push(GameComponent.INPUTS_END as Input);
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
    if (this.question) {
      const word = this.question.answer;
      const attempt = this.proposed_answerInputs.join('');
      if (!this.wordAttempts[word]) {
        this.wordAttempts[word] = [];
      }
      this.wordAttempts[word].push(attempt);
    }


    if (AnswerChecker.checkAnswer(this.proposed_answerInputs, this.expected_answerInputs, this.question.notion)) {
      this.score += 10;
      this.gameEngine.score = this.score;
      this.gameEngine.answerCorrectly();
    } else {
      this.gameEngine.answerIncorrectly(this.proposed_answerInputs.join(''));
    }
    this.loadNewQuestion();
    if (!this.question) {
      this.endGame();
      return;
    }


    this.expected_answerInputs = this.question.answer.split("");
    this.proposed_answerInputs = [];
    this.cursorPosition = 0;
  }

  private writeCharacter(c: string): void {
    this.proposed_answerInputs.splice(
      this.cursorPosition++, 0, c
    );
    this.updateInputs();

    if (this.proposed_answerInputs.length === this.expected_answerInputs.length) {
      if (AnswerChecker.checkAnswer(this.proposed_answerInputs, this.expected_answerInputs, this.question.notion)) {
        this.submitAnswer();
      }
    }

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
        if (!this.enterTimeoutActive) {
          this.enterTimeoutActive = true;
          if (this.proposed_answerInputs.length > 0) {
            this.submitAndProceed();
          }
          setTimeout(() => {
            this.enterTimeoutActive = false;
          }, 500);
        }
        break;

      default:
        if (keyPressed.length === 1) {
          this.writeCharacter(keyPressed);
        }
        break;
    }
  }

  private submitAndProceed(): void {
    if (this.question) {
      const word = this.question.answer;
      const attempt = this.proposed_answerInputs.join('');
      if (!this.wordAttempts[word]) {
        this.wordAttempts[word] = [];
      }
      this.wordAttempts[word].push(attempt);

      // Check if answer is correct
      if (AnswerChecker.checkAnswer(this.proposed_answerInputs, this.expected_answerInputs, this.question.notion)) {
        // Correct answer
        this.score += 10;
        this.gameEngine.score = this.score;
        this.gameEngine.answerCorrectly();
      } else {
        // Wrong answer
        this.gameEngine.answerIncorrectly(this.proposed_answerInputs.join(''));
      }

      this.loadNewQuestion();
      if (!this.question) {
        this.endGame();
        return;
      }

      this.expected_answerInputs = this.question.answer.split("");
      this.proposed_answerInputs = [];
      this.cursorPosition = 0;
    }
  }

  private showAnswer(): void {
    this.gameEngine.showAnswer();
  }

  public endGame(): void {
    if (this.hasEnded) return;
    this.hasEnded = true;
    this.stopMusic();
    const gameStats = this.gameEngine.getGameStatistics(this.user.userId);

    if (gameStats.wordsLeastSuccessful) {
      gameStats.wordsLeastSuccessful = (gameStats.wordsLeastSuccessful as WordStats[]).map(entry => ({
        ...entry,
        attempts: this.wordAttempts[entry.word] || []
      }));
    }

    console.log('[ENDGAME] Sending gameStats to backend:', JSON.stringify(gameStats, null, 2));

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
  public static checkAnswer(proposed_answer: string[], expected_answer: string[], question_type: QuestionNotion): boolean {
    const proposed = proposed_answer.join('').replace(/\s+/g, ' ').trim();
    const expected = expected_answer.join('').replace(/\s+/g, ' ').trim();

    if (proposed === expected) return true;

    if (question_type === QuestionNotion.REWRITING || question_type === QuestionNotion.ADDITION || question_type === QuestionNotion.SUBTRACTION || question_type === QuestionNotion.MULTIPLICATION || question_type === QuestionNotion.DIVISION) {
      const expectedWithSpaces = expected.replace(/-/g, ' ');
      if (proposed === expectedWithSpaces) return true;

      const expectedWithDashes = expected.replace(/ /g, '-');
      if (proposed === expectedWithDashes) return true;

      const normalize = (s: string) => s.replace(/[-\s]+/g, ' ').trim();
      if (normalize(proposed) === normalize(expected)) return true;
    }
    return false;

  }
}

/*
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
  */



