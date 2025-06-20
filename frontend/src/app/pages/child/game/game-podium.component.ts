import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { QuestionConfigService } from 'src/app/shared/services/question-config.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-podium',
    templateUrl: './game-podium.component.html',
    styleUrls: ['./game-podium.component.scss']
})
export class GamePodiumComponent implements OnInit, OnDestroy {
    @ViewChild('gameMusic', { static: false }) gameMusicRef!: ElementRef<HTMLAudioElement>;

    public user?: User;
    public userScore: number = 0;
    public questionsAnswered: number = -1;
    public showScore: boolean = false;
    private configSubscription?: Subscription;

    constructor(
        private route: ActivatedRoute, 
        private userService: UserService, 
        private router: Router,
        private questionConfigService: QuestionConfigService
    ) { }

    ngOnInit(): void {
        const state = this.route.snapshot.queryParams;
        this.user = JSON.parse(state['user'] || '{}');
        this.questionsAnswered = Number(state['questionsAnswered']) - 1 || 0;
        this.userScore = typeof state['score'] !== 'undefined' ? Number(state['score']) : this.userService.getScore();

        // Subscribe to config service to get showScore setting
        this.configSubscription = this.questionConfigService.getConfig().subscribe(config => {
            this.showScore = config.showScore;
        });

        // Update user's money with the score
        if (this.user && this.userScore > 0) {
            this.userService.updateMoney(this.user.userId, this.userScore).subscribe({
                next: (updatedUser) => {
                    this.user = updatedUser;
                    console.log('Money updated successfully:', updatedUser.money);
                },
                error: (err) => console.error('Error updating money:', err)
            });
        }
    }

    ngOnDestroy(): void {
        if (this.configSubscription) {
            this.configSubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        this.startMusic();
    }

    private startMusic(): void {
        const audioElement = this.gameMusicRef.nativeElement;
        audioElement.play().catch((error) => {
            console.error('Error playing music:', error);
        });
    }

    goToStats() {
        this.router.navigate(['/child-stats']);
    }
}