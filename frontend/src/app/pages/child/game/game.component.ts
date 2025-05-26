import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Question } from 'src/app/shared/models/question.model';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { GameEngine } from './game-engine';
import { FontService } from 'src/app/shared/services/font.service';
import { GameStatisticsService } from '../../../shared/services/game-statistics.service';

import { QuestionConfigService} from "../../../shared/services/question-config.service";
import { Subscription } from "rxjs";
import { Router } from '@angular/router';
import { QuestionService } from 'src/app/shared/services/question.service';
import { UserConfig } from 'src/app/shared/models/user-config.model';

// Import the backend question generator
//import { QuestionsGenerator } from 'backend/app/questions/QuestionsGenerator';

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

  constructor(
    private userService: UserService,
    private questionConfigService: QuestionConfigService,
    private fontService: FontService,
    private router: Router,
    private questionService: QuestionService // Inject QuestionService
  ) {
this.userService.selectedUser$.subscribe((user: User | null) => {
  if (user) {
    this.user = user;
  } else {
    // Handle the case where no user is selected, e.g. redirect or show a message
    console.warn('No user selected in game.');
    // Optionally: this.router.navigate(['/child-list']);
  }
});

    this.fontService.selectedFont$.subscribe((font) => {
      console.log('Font updated in GameComponent:', font);
      this.fontFamily = font;
    });

    // Subscribe to config changes
    this.configSubscription = this.questionConfigService.getConfig().subscribe(() => {
      this.loadNewQuestion();
    });

    // Initial setup
    this.loadNewQuestion();

    this.keydownHandler = this.checkInput.bind(this);
  }

  ngOnInit(): void {   
    document.addEventListener("keydown", this.keydownHandler);
    this.updateInputs();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.gameEngine = new GameEngine(this, canvas, this.fontService);
    this.startMusic();
  }

  ngOnDestroy(): void {
    document.removeEventListener("keydown", this.keydownHandler);
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    this.stopMusic();
  }

  private startMusic(): void {
    const audioElement = this.gameMusicRef.nativeElement;
    audioElement.play().catch((error) => {
      console.error('Error playing music:', error);
    });
  }

  private stopMusic(): void {
    const audioElement = this.gameMusicRef.nativeElement;
    audioElement.pause();
    audioElement.currentTime = 0;
  }

  private loadNewQuestion(): void {
    console.log("Requesting new question");
    if (!this.user) 
    {
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
      },
      (error) => {
        console.error('Error fetching question:', error);
        this.hasEnded = true; // End the game if question generation fails
      }
    );
  }

  private updateInputs(): void {
    const showsAnswer = this.questionConfigService.getCurrentConfig()?.showsAnswer ?? false;
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

  private submitAnswer(): void {
    if (AnswerChecker.checkAnswer(this.proposed_answer, this.question)) {
      this.score += 10;
      this.gameEngine.answerCorrectly();
    }
    this.loadNewQuestion(); 
  }

  private checkInput(event: KeyboardEvent): void {
    const keyPressed = event.key;

    switch (keyPressed) {
      case "Home":
        this.cursorPosition = 0;
        break;
      case "End":
        this.cursorPosition = this.proposed_answerInputs.length;
        break;
      case "ArrowLeft":
        if (this.cursorPosition > 0) this.cursorPosition--;
        break;
      case "ArrowRight":
        if (this.cursorPosition < this.proposed_answerInputs.length) this.cursorPosition++;
        break;
      case "Delete":
        if (this.cursorPosition < this.proposed_answerInputs.length) {
          this.proposed_answerInputs.splice(this.cursorPosition, 1);
        }
        break;
      case "Backspace":
        if (this.cursorPosition > 0) {
          this.cursorPosition--;
          this.proposed_answerInputs.splice(this.cursorPosition, 1);
        }
        break;
      case "Enter":
        this.submitAnswer();
        break;
      default:
        if (keyPressed.length === 1) {
          this.proposed_answerInputs.splice(this.cursorPosition++, 0, keyPressed);
        }
        break;
    }
    this.updateInputs();
  }

  public get proposed_answer(): string {
    return this.proposed_answerInputs.join("");
  }
}



class AnswerChecker {
    public static checkAnswer(proposed_answer: string, question: Question): boolean {
        return proposed_answer === question.answer;
    }
}



