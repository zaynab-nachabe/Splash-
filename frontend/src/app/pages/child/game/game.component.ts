import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Question } from 'src/app/shared/models/question.model';
import { QuestionNotion } from 'src/app/shared/models/QuestionGenerationUtils/QuestionNotionEnum';
//import { MOCK_QUESTIONS } from 'src/app/shared/mocks/question.mock';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { GameEngine } from './game-engine';
import {QuestionConfig, QuestionConfigService} from "../../../shared/services/question-config.service";
import {Subscription} from "rxjs";


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
  private static readonly INPUTS_END: Input = {
    letter: '\xa0', status: "pending"
  };

  private configSubscription: Subscription;


  public user!: User;

    public question!: Question;
    private keydownHandler: (event: KeyboardEvent) => void;

    public expected_answerInputs: string[] = [];
    public proposed_answerInputs: string[] = [];
    public inputs: Input[] = [];

    public cursorPosition: number;

    @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
    private gameEngine!: GameEngine;

    public score: number;
    private hasEnded: boolean;


    ////////////////////////////////////////////////////////////////////////////
    // Constructors & Destructors :

    constructor(private userService: UserService, private questionConfigService: QuestionConfigService) {
        this.userService.selectedUser$.subscribe((user: User) => {
            this.user = user;
        });

      // Subscribe to config changes
      this.configSubscription = this.questionConfigService.getConfig().subscribe(() => {
        // Regenerate question when config changes
        QuestionsGenerator.init(this.questionConfigService);
        const newQuestion = QuestionsGenerator.genNewQuestion();
        if (!newQuestion) {
          this.hasEnded = true;
          throw new Error("No questions could be generated");
        }
        this.question = newQuestion;
        this.expected_answerInputs = this.question.answer.split("");
        this.proposed_answerInputs = [];
        this.updateInputs();
      });

      // Initial setup
      QuestionsGenerator.init(this.questionConfigService);
      const newQuestion = QuestionsGenerator.genNewQuestion();
      if (!newQuestion) {
        this.hasEnded = true;
        throw new Error("No questions could be generated");
      }
      this.question = newQuestion;


      this.keydownHandler = this.checkInput.bind(this);

        this.expected_answerInputs = this.question.answer.split("");
        this.proposed_answerInputs = [];
        this.inputs = [];

        this.cursorPosition = 0;

        this.score = 0;

        this.hasEnded = false;
    }

    ngOnInit(): void {
        document.addEventListener("keydown", this.keydownHandler);
        this.updateInputs();
    }

    ngAfterViewInit(): void {
        const canvas = this.canvasRef.nativeElement;
        this.gameEngine = new GameEngine(this, canvas);
    }

    ngOnDestroy(): void {
        document.removeEventListener("keydown", this.keydownHandler);
      if (this.configSubscription) {
        this.configSubscription.unsubscribe();
      }

    }


    ////////////////////////////////////////////////////////////////////////////
    // Getters :

    public get proposed_answer(): string {
        return this.proposed_answerInputs.join("");
    }

    private updateInputs(): void {
        const userConfig = this.user.userConfig;
        const showsAnswer = (
            userConfig.showsAnswer
            || this.question.notion == QuestionNotion.ENCRYPTION
        );

        const PENDING_SPACE: Input = {letter: '\xa0', status: "pending"};
        const CORRECT_SPACE: Input = {letter: '\xa0', status: "correct"};
        const WRONG_SPACE: Input = {letter: '·', status: "wrong"};

        let ret: Input[] = [];

        const LENGTH = Math.max(
            this.proposed_answerInputs.length,
            this.expected_answerInputs.length,
        );
        for (let i=0; i<LENGTH; i++) {
            const proposed_letter = this.proposed_answerInputs[i];
            const expected_letter = this.expected_answerInputs[i];

            if (proposed_letter === expected_letter) {
                ret[i] = (
                    (proposed_letter !== ' ')
                    ? {letter: proposed_letter, status: "correct"}
                    : CORRECT_SPACE
                );
            } else if (proposed_letter === undefined) {
                if (!showsAnswer) break;

                ret[i] = (
                    (expected_letter !== ' ')
                    ? {letter: expected_letter, status: "pending"}
                    : PENDING_SPACE
                );
            } else {
                ret[i] = (
                    (proposed_letter !== ' ')
                    ? {letter: proposed_letter, status: "wrong"}
                    : WRONG_SPACE
                );
            }
        }

        ret.push(GameComponent.INPUTS_END);

        this.inputs = ret;
    }


    ////////////////////////////////////////////////////////////////////////////
    // Actions :

    private gotoStart(): void {
        this.cursorPosition = 0;
    }

    private gotoEnd(): void {
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
    }

    private deletePreviousCharacter(): void {
        if (this.cursorPosition == 0)
            return;

        this.cursorPosition--;
        this.proposed_answerInputs.splice(this.cursorPosition, 1);
    }

    private submitAnswer(): void {
        if (AnswerChecker.checkAnswer(this.proposed_answer, this.question)){
            this.score++;
            this.gameEngine.answerCorrectly();
        }

      const newQuestion = QuestionsGenerator.genNewQuestion();
      if (!newQuestion) {
        this.hasEnded = true;
        return;
      }

      this.question = newQuestion;


      if (this.question === undefined) {
            this.hasEnded = true;
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
    }

    private checkInput(event: KeyboardEvent): void {
        const keyPressed = event.key;

        switch (keyPressed) {
            case "Home" :
                this.gotoStart();
                break;

            case "End" :
                this.gotoEnd();
                break;

            case "ArrowLeft" :
                this.moveToTheLeft();
                break;

            case "ArrowRight" :
                this.moveToTheRight();
                break;

            case "Delete" :
                this.deleteCurrentCharacter();
                break;

            case "Backspace" :
                this.deletePreviousCharacter();
                break;

            case "Enter" :
                this.submitAnswer();
                break;

            default :
                if (keyPressed.length === 1) {
                    this.writeCharacter(keyPressed);
                }
                break;
        }
        this.updateInputs();
    }
}



////////////////////////////////////////////////////////////////////////////////
// Backend Simulator :
////////////////////////////////////////////////////////////////////////////////


class QuestionsGenerator {
  private static questionCount = 10; // Number of questions to generate
  private static currentIndex = 0;
  private static configService: QuestionConfigService;
  private static currentConfig: QuestionConfig;

  private constructor() {}

  public static init(configService: QuestionConfigService) {
    QuestionsGenerator.configService = configService;
    QuestionsGenerator.currentIndex = 0;
    QuestionsGenerator.currentConfig = configService.getCurrentConfig();

    // Subscribe to config changes
    QuestionsGenerator.configService.getConfig().subscribe(config => {
      QuestionsGenerator.currentConfig = config;
    });


    const randomSeed = Math.floor(Math.random() * 1000000);
    Question.resetSeed(randomSeed);

  }

  public static genNewQuestion(): Question | undefined {
    if (QuestionsGenerator.currentIndex >= QuestionsGenerator.questionCount) {
      return undefined;
    }

    QuestionsGenerator.currentIndex++;
    const config = QuestionsGenerator.currentConfig;

    return new Question(QuestionsGenerator.configService);
  }
}



class AnswerChecker {
    public static checkAnswer(proposed_answer: string, question: Question): boolean {
        return proposed_answer === question.answer;
    }
}
